<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;


class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int)$request->query('per_page', 10), 1), 50);

        $q = User::query()
            ->with(['posts' => fn($x) => $x->latest('id')])
            ->latest('id');

        $paginator = $q->paginate($perPage)->appends($request->query());

        return UserResource::collection($paginator);
    }
}
