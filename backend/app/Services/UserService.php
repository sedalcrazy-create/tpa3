<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UserService
{
    /**
     * Get paginated list of users with optional filters.
     *
     * @param array<string, mixed> $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function list(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query()->with('role');

        // Search by name, email, or national_code
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('national_code', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if (!empty($filters['role_id'])) {
            $query->where('role_id', $filters['role_id']);
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $query->orderBy('name');

        return $query->paginate($perPage);
    }

    /**
     * Find a user by ID with role and permissions loaded.
     *
     * @param int $id
     * @return User
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function find(int $id): User
    {
        return User::with('role.permissions')->findOrFail($id);
    }

    /**
     * Create a new user.
     *
     * @param array<string, mixed> $data
     * @return User
     */
    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        $user = User::create($data);

        return $user->load('role');
    }

    /**
     * Update an existing user.
     *
     * @param User $user
     * @param array<string, mixed> $data
     * @return User
     */
    public function update(User $user, array $data): User
    {
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->load('role');
    }

    /**
     * Delete a user. Prevents deleting the currently authenticated user.
     *
     * @param User $user
     * @return void
     *
     * @throws HttpException
     */
    public function delete(User $user): void
    {
        if (Auth::id() === $user->id) {
            throw new HttpException(403, 'امکان حذف حساب کاربری خود وجود ندارد.');
        }

        $user->tokens()->delete();
        $user->delete();
    }

    /**
     * Toggle user active status. Revokes all tokens when deactivating.
     *
     * @param User $user
     * @return User
     */
    public function toggleActive(User $user): User
    {
        $user->is_active = !$user->is_active;
        $user->save();

        // If deactivating, revoke all tokens
        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return $user->load('role');
    }
}
