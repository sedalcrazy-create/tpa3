<?php

namespace App\Services\Claim;

use App\Enums\ClaimStatus;

class ClaimStateMachine
{
    /**
     * Check if a transition from one status to another is allowed.
     *
     * @param ClaimStatus $from
     * @param ClaimStatus $to
     * @return bool
     */
    public function canTransition(ClaimStatus $from, ClaimStatus $to): bool
    {
        return $from->canTransitionTo($to);
    }

    /**
     * Validate that a transition is allowed. Throws an exception if not.
     *
     * @param ClaimStatus $from
     * @param ClaimStatus $to
     * @return void
     *
     * @throws \InvalidArgumentException
     */
    public function validateTransition(ClaimStatus $from, ClaimStatus $to): void
    {
        if (!$this->canTransition($from, $to)) {
            $allowed = $this->getNextStatuses($from);
            $allowedLabels = array_map(fn (array $s) => $s['label'], $allowed);
            $allowedStr = !empty($allowedLabels)
                ? implode('، ', $allowedLabels)
                : 'هیچ وضعیتی';

            throw new \InvalidArgumentException(
                "انتقال از وضعیت «{$from->label()}» به «{$to->label()}» مجاز نیست. وضعیت‌های مجاز: {$allowedStr}."
            );
        }
    }

    /**
     * Get the list of allowed next statuses from the current status.
     *
     * @param ClaimStatus $current
     * @return array<int, array{value: int, label: string}>
     */
    public function getNextStatuses(ClaimStatus $current): array
    {
        $allowed = $current->allowedTransitions();

        return array_map(fn (ClaimStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], $allowed);
    }
}
