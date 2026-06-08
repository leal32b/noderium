//! Spaced repetition (FSRS, FR-6): card creation, grading, and the due queue.
//! SRS state lives in the CRDT; `srs_cards` is just a query index, mapped here.

use noderium_srs::{CardState, Phase, Scheduler};
use noderium_store::SrsCard;

use crate::{CoreError, Rating, Result, Workspace};

impl Workspace {
    /// Turn a note or block into a review card, due immediately.
    pub fn create_card(
        &self,
        card_id: &str,
        target_id: &str,
        card_type: &str,
        now: i64,
    ) -> Result<()> {
        let state = Scheduler::new_card(now);
        self.store
            .upsert_card(&to_row(card_id, target_id, card_type, &state))?;
        Ok(())
    }

    /// Grade a card review; reschedules via FSRS and updates the queue index.
    pub fn review_card(&self, card_id: &str, rating: Rating, now: i64) -> Result<()> {
        let card = self
            .store
            .get_card(card_id)?
            .ok_or_else(|| CoreError::CardNotFound(card_id.to_string()))?;
        let next = self.scheduler.review(&from_row(&card), rating, now);
        self.store
            .upsert_card(&to_row(&card.id, &card.target_id, &card.card_type, &next))?;
        Ok(())
    }

    /// The review queue: cards due at or before `now` (target ids).
    pub fn due_cards(&self, now: i64) -> Result<Vec<SrsCard>> {
        Ok(self.store.due_cards(now)?)
    }
}

fn to_row(id: &str, target_id: &str, card_type: &str, state: &CardState) -> SrsCard {
    SrsCard {
        id: id.to_string(),
        target_id: target_id.to_string(),
        card_type: card_type.to_string(),
        due: state.due_ms,
        stability: state.stability,
        difficulty: state.difficulty,
        reps: state.reps,
        lapses: state.lapses,
        state: state.phase.as_str().to_string(),
        last_review: state.last_review_ms,
    }
}

fn from_row(card: &SrsCard) -> CardState {
    CardState {
        due_ms: card.due,
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        phase: Phase::parse(&card.state),
        last_review_ms: card.last_review,
    }
}
