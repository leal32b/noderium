//! noderium-srs — FSRS scheduler (FR-6) wrapping `rs-fsrs`.
//!
//! SRS *state* lives in the CRDT as properties; `srs_cards` in SQLite is just a
//! query index. This crate is the pure scheduling logic: given a card's state
//! and a review rating, compute the next state. Times are epoch-millis at this
//! boundary (chrono lives inside).

use chrono::{DateTime, Utc};
use rs_fsrs::{Card as FsrsCard, Parameters, State, FSRS};

pub use rs_fsrs::Rating;

/// The learning phase of a card (mirrors FSRS `State`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    New,
    Learning,
    Review,
    Relearning,
}

impl Phase {
    /// Stable string for persistence (matches `srs_cards.state`).
    pub fn as_str(self) -> &'static str {
        match self {
            Phase::New => "new",
            Phase::Learning => "learning",
            Phase::Review => "review",
            Phase::Relearning => "relearning",
        }
    }

    /// Parse a persisted state string (unknown values fall back to `New`).
    pub fn parse(value: &str) -> Phase {
        match value {
            "learning" => Phase::Learning,
            "review" => Phase::Review,
            "relearning" => Phase::Relearning,
            _ => Phase::New,
        }
    }
}

/// Map a rating string (e.g. from a UI/Tauri command) to a [`Rating`].
pub fn rating_from_str(value: &str) -> Option<Rating> {
    match value {
        "again" => Some(Rating::Again),
        "hard" => Some(Rating::Hard),
        "good" => Some(Rating::Good),
        "easy" => Some(Rating::Easy),
        _ => None,
    }
}

/// A card's scheduling state — the persisted shape, in epoch millis.
#[derive(Debug, Clone, PartialEq)]
pub struct CardState {
    pub due_ms: i64,
    pub stability: f64,
    pub difficulty: f64,
    pub reps: i32,
    pub lapses: i32,
    pub phase: Phase,
    pub last_review_ms: i64,
}

/// FSRS scheduler with default parameters.
pub struct Scheduler {
    fsrs: FSRS,
}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}

impl Scheduler {
    pub fn new() -> Self {
        Self {
            fsrs: FSRS::new(Parameters::default()),
        }
    }

    /// A fresh, never-reviewed card due immediately at `now_ms`.
    pub fn new_card(now_ms: i64) -> CardState {
        CardState {
            due_ms: now_ms,
            stability: 0.0,
            difficulty: 0.0,
            reps: 0,
            lapses: 0,
            phase: Phase::New,
            last_review_ms: now_ms,
        }
    }

    /// Apply a review `rating` at `now_ms`, returning the next card state.
    pub fn review(&self, card: &CardState, rating: Rating, now_ms: i64) -> CardState {
        let next = self.fsrs.repeat(to_fsrs(card), to_dt(now_ms));
        let info = next
            .get(&rating)
            .expect("FSRS always schedules every rating");
        from_fsrs(&info.card)
    }
}

fn to_dt(ms: i64) -> DateTime<Utc> {
    DateTime::<Utc>::from_timestamp_millis(ms).unwrap_or_default()
}

fn phase_to_state(phase: Phase) -> State {
    match phase {
        Phase::New => State::New,
        Phase::Learning => State::Learning,
        Phase::Review => State::Review,
        Phase::Relearning => State::Relearning,
    }
}

fn state_to_phase(state: State) -> Phase {
    match state {
        State::New => Phase::New,
        State::Learning => Phase::Learning,
        State::Review => Phase::Review,
        State::Relearning => Phase::Relearning,
    }
}

fn to_fsrs(card: &CardState) -> FsrsCard {
    FsrsCard {
        due: to_dt(card.due_ms),
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: card.reps,
        lapses: card.lapses,
        state: phase_to_state(card.phase),
        last_review: to_dt(card.last_review_ms),
    }
}

fn from_fsrs(card: &FsrsCard) -> CardState {
    CardState {
        due_ms: card.due.timestamp_millis(),
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        phase: state_to_phase(card.state),
        last_review_ms: card.last_review.timestamp_millis(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const NOW: i64 = 1_700_000_000_000; // 2023-11-14T22:13:20Z

    #[test]
    fn new_card_is_due_now_and_unreviewed() {
        let card = Scheduler::new_card(NOW);
        assert_eq!(card.phase, Phase::New);
        assert_eq!(card.due_ms, NOW);
        assert_eq!(card.reps, 0);
    }

    #[test]
    fn reviewing_schedules_into_the_future_and_counts_reps() {
        let scheduler = Scheduler::new();
        let card = Scheduler::new_card(NOW);
        let good = scheduler.review(&card, Rating::Good, NOW);

        assert_eq!(good.reps, 1);
        assert!(good.due_ms > NOW, "a reviewed card should be due later");
        assert_ne!(good.phase, Phase::New);
    }

    #[test]
    fn again_is_scheduled_sooner_than_good() {
        let scheduler = Scheduler::new();
        let card = Scheduler::new_card(NOW);
        let again = scheduler.review(&card, Rating::Again, NOW);
        let good = scheduler.review(&card, Rating::Good, NOW);
        assert!(
            again.due_ms <= good.due_ms,
            "Again ({}) should be due no later than Good ({})",
            again.due_ms,
            good.due_ms,
        );
    }

    #[test]
    fn successful_reviews_increase_stability() {
        let scheduler = Scheduler::new();
        let first = scheduler.review(&Scheduler::new_card(NOW), Rating::Good, NOW);
        // Review again at its due date.
        let second = scheduler.review(&first, Rating::Good, first.due_ms);
        assert!(
            second.stability >= first.stability,
            "stability should not shrink across successful reviews ({} -> {})",
            first.stability,
            second.stability,
        );
        assert_eq!(second.reps, 2);
    }
}
