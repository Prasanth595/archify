-- Authored fixture: conjunction order, not a runtime trace.
example (p q : Prop) : p ∧ q → q ∧ p := by
  intro h
  constructor
  · exact h.right
  · exact h.left
