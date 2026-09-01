<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_ip_address', 45)->nullable()->after('email');
            $table->text('last_user_agent')->nullable()->after('last_ip_address');
            $table->timestamp('last_active_at')->nullable()->after('last_user_agent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_ip_address', 'last_user_agent', 'last_active_at']);
        });
    }
};
