<?php

namespace App\Http\Middleware;

use App\Models\AuditLog as AuditLogModel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLog
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log write operations
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $this->logAction($request, $response);
        }

        return $response;
    }

    private function logAction(Request $request, Response $response): void
    {
        try {
            $action = match ($request->method()) {
                'POST' => 'create',
                'PUT', 'PATCH' => 'update',
                'DELETE' => 'delete',
                default => 'unknown',
            };

            AuditLogModel::create([
                'user_id' => $request->user()?->id,
                'action' => $action,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
        } catch (\Throwable) {
            // Silently fail - audit logging should not break the request
        }
    }
}
