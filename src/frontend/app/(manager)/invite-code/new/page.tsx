"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { createInviteCode, getInviteRoles, type CreatedInviteResponse, type InviteRoleOption } from "@/lib/fast-api/inviteCodes";

export default function NewInviteCodePage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [roles, setRoles] = useState<InviteRoleOption[]>([]);
	const [selectedRoleId, setSelectedRoleId] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [created, setCreated] = useState<CreatedInviteResponse | null>(null);
	const [loadingRoles, setLoadingRoles] = useState(false);

	useEffect(() => {
		const fetchRoles = async () => {
			setLoadingRoles(true);
			try {
				const data = await getInviteRoles();
				setRoles(data);
				if (data.length > 0) {
					setSelectedRoleId(data[0].id);
				}
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : String(err);
				setError(message);
				console.error("Fetch Invite Roles Error:", err);
			} finally {
				setLoadingRoles(false);
			}
		};

		fetchRoles();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setCreated(null);
		setLoading(true);

		try {
			const result = await createInviteCode({ name, email, roleId: selectedRoleId });
			setCreated(result);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
			console.error("Create Invite Code Error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="flex-1 p-8">
			<div className="max-w-2xl mx-auto">
				<div className="mb-8">
					<Header
						pageName="Create Invite Code"
						description="Generate a new invite code for a staff member"
					/>
				</div>

				{error && (
					<div className="mb-4 text-red-500 text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-100">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
							placeholder="Nguyen Van A"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
							placeholder="staff@example.com"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Role
						</label>
						<select
							value={selectedRoleId}
							onChange={(e) => setSelectedRoleId(e.target.value)}
							className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
							disabled={loadingRoles || roles.length === 0}
						>
							{roles.map((roleOption) => (
								<option key={roleOption.id} value={roleOption.id}>
									{roleOption.name}
								</option>
							))}
						</select>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="mt-2 inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-lg active:scale-95 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{loading ? "Generating..." : "Generate Invite Code"}
					</button>
				</form>

				{created && (
					<div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-2">Invite Code Generated</h2>
						<p className="text-sm text-gray-500 mb-4">
							Share this code with <span className="font-medium text-gray-900">{name}</span> ({email}).
						</p>
						<div className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white text-xl font-mono tracking-[0.2em]">
							{created.plain_code ?? "(no code)"}
						</div>
						<p className="mt-3 text-xs text-gray-400">
							Role: {created.role_name} • Store: {created.store_name}
						</p>
					</div>
				)}
			</div>
		</main>
	);
}