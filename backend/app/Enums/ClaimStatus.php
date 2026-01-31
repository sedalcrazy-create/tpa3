<?php

namespace App\Enums;

enum ClaimStatus: int
{
    case Returned = 1;
    case Register = 2;
    case WaitCheck = 3;
    case WaitConfirm = 4;
    case WaitFinancial = 5;
    case Archived = 6;
    case WaitRecheck = 8;

    public function label(): string
    {
        return match ($this) {
            self::Returned => 'برگشت داده شده',
            self::Register => 'ثبت شده',
            self::WaitCheck => 'در انتظار بررسی',
            self::WaitConfirm => 'در انتظار تایید',
            self::WaitFinancial => 'در انتظار تسویه مالی',
            self::Archived => 'بایگانی شده',
            self::WaitRecheck => 'در انتظار بازبررسی',
        };
    }

    /**
     * Get allowed transitions from current status.
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Register => [self::WaitCheck],
            self::WaitCheck => [self::WaitConfirm, self::WaitRecheck, self::Returned],
            self::WaitConfirm => [self::WaitFinancial, self::Returned],
            self::WaitFinancial => [self::Archived],
            self::WaitRecheck => [self::WaitCheck],
            self::Returned => [self::Register],
            self::Archived => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions());
    }
}
