"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getInviteCodes, type InviteCodeItem } from "@/lib/fast-api/inviteCodes";

export default function InviteCodePage() {
	const [codes, setCodes] = useState<InviteCodeItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");

	const fetchCodes = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getInviteCodes();
			setCodes(data);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			setError(message);
			console.error("Invite Codes Fetch Error:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCodes();
	}, []);

	return (
		<main className="flex-1 p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<Header
						pageName="Invite Codes"
						description="View and manage your staff invite codes"
					/>
					<Link
						href="/invite-code/new"
						className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-lg active:scale-95 font-semibold"
					>
						Create New Invite Code
					</Link>
				</div>

				{error && (
					<div className="mb-4 text-red-500 text-sm font-semibold bg-red-50 px-3 py-2 rounded-lg border border-red-100">
						{error}
					</div>
				)}

				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					<table className="min-w-full font-sans">
						<thead className="bg-gray-50 border-b border-gray-100">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
									#
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
									Created By
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
									Role
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
									Store
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
									Status
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
									Created At
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{codes.length > 0 ? (
								codes.map((code, index) => (
									<tr key={code.id} className="hover:bg-gray-50/50 transition-colors">
										<td className="px-6 py-4 text-sm text-gray-800 font-medium">
											{index + 1}
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{code.created_by_user_name}
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{code.role_name}
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{code.store_name}
										</td>
										<td className="px-6 py-4 text-sm font-semibold">
											{code.used_at ? (
												<span className="text-gray-500">Used</span>
											) : (
												<span className="text-emerald-600">Unused</span>
											)}
										</td>
										<td className="px-6 py-4 text-sm text-gray-500">
											{new Date(code.created_at).toLocaleString()}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
										{loading ? "Loading invite codes..." : "No invite codes found for your store."}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</main>
	);
}