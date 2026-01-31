<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserListResource;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * Display a paginated list of users.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'role_id',
            'is_active',
        ]);

        $perPage = (int) $request->query('per_page', 15);

        $users = $this->userService->list($filters, $perPage);

        return $this->paginatedResponse(
            UserListResource::collection($users)
        );
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return $this->createdResponse(
            new UserResource($user),
            'کاربر با موفقیت ایجاد شد.'
        );
    }

    /**
     * Display the specified user.
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->find($id);

        return $this->successResponse(
            new UserResource($user)
        );
    }

    /**
     * Update the specified user.
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->find($id);
        $user = $this->userService->update($user, $request->validated());

        return $this->successResponse(
            new UserResource($user),
            'اطلاعات کاربر با موفقیت به‌روزرسانی شد.'
        );
    }

    /**
     * Remove the specified user.
     */
    public function destroy(int $id): JsonResponse
    {
        $user = $this->userService->find($id);
        $this->userService->delete($user);

        return $this->successResponse(
            message: 'کاربر با موفقیت حذف شد.'
        );
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $user = $this->userService->find($id);
        $user = $this->userService->toggleActive($user);

        $status = $user->is_active ? 'فعال' : 'غیرفعال';

        return $this->successResponse(
            new UserResource($user),
            "وضعیت کاربر به {$status} تغییر یافت."
        );
    }
}
