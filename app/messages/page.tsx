"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ConversationMessage } from "@/lib/messages";

type Conversation = {
	userId: string;
	userName: string;
	lastMessage: ConversationMessage;
	unreadCount: number;
};

function MessagesContent() {
	const searchParams = useSearchParams();
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUserName, setCurrentUserName] = useState<string>("");
	const [messages, setMessages] = useState<ConversationMessage[]>([]);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isComposing, setIsComposing] = useState(false);
	const [newMessage, setNewMessage] = useState({
		recipientId: "",
		recipientName: "",
		subject: "",
		content: "",
	});
	const [replyMessage, setReplyMessage] = useState({
		subject: "",
		content: "",
	});
	const [sendError, setSendError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [isReplyingSending, setIsReplyingSending] = useState(false);

	// Fetch current user from authentication API
	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
				const response = await fetch("/api/user/me");
				if (response.ok) {
					const data = await response.json();
					if (data.authenticated) {
						setCurrentUserId(data.userId);
						setCurrentUserName(data.userName);
					} else {
						setError("You must be logged in to view messages");
					}
				} else {
					setError("You must be logged in to view messages");
				}
			} catch (err) {
				console.error("Failed to fetch current user", err);
				setError("Failed to load user information");
			}
		};

		fetchCurrentUser();
	}, []);

	// Handle URL parameters for pre-filling compose form
	useEffect(() => {
		const recipientId = searchParams.get("recipientId");
		const recipientName = searchParams.get("recipientName");
		const compose = searchParams.get("compose");

		if (compose === "true" && recipientId && recipientName) {
			setIsComposing(true);
			setNewMessage((prev) => ({
				...prev,
				recipientId,
				recipientName,
			}));
		}
	}, [searchParams]);

	const fetchMessages = useCallback(async () => {
		if (!currentUserId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/messages", {
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch messages");
			}

			const data = await response.json();
			setMessages(data.messages || []);

			// Group messages into conversations
			const conversationMap = new Map<string, Conversation>();

			for (const msg of data.messages || []) {
				const otherUserId =
					msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
				const otherUserName =
					msg.senderId === currentUserId
						? msg.recipientName
						: msg.senderName;

				if (!conversationMap.has(otherUserId)) {
					conversationMap.set(otherUserId, {
						userId: otherUserId,
						userName: otherUserName,
						lastMessage: msg,
						unreadCount: 0,
					});
				}

				const conv = conversationMap.get(otherUserId)!;

				// Update last message if this one is newer
				if (
					new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)
				) {
					conv.lastMessage = msg;
				}

				// Count unread messages where current user is recipient
				if (msg.recipientId === currentUserId && !msg.isRead) {
					conv.unreadCount++;
				}
			}

			setConversations(Array.from(conversationMap.values()));
		} catch (err) {
			console.error("Failed to load messages", err);
			setError("Unable to load messages. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [currentUserId]);

	useEffect(() => {
		fetchMessages();
	}, [fetchMessages]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		setSendError(null);
		setIsSending(true);

		try {
			if (!newMessage.recipientId || !newMessage.recipientName) {
				setSendError("Please enter recipient ID and name");
				return;
			}

			if (!newMessage.subject.trim()) {
				setSendError("Please enter a subject");
				return;
			}

			if (!newMessage.content.trim()) {
				setSendError("Please enter message content");
				return;
			}

			const response = await fetch("/api/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					recipientId: newMessage.recipientId,
					recipientName: newMessage.recipientName,
					subject: newMessage.subject,
					content: newMessage.content,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to send message");
			}

			// Reset form and refresh messages
			setNewMessage({
				recipientId: "",
				recipientName: "",
				subject: "",
				content: "",
			});
			setIsComposing(false);
			await fetchMessages();
		} catch (err) {
			console.error("Failed to send message", err);
			setSendError(
				err instanceof Error ? err.message : "Failed to send message"
			);
		} finally {
			setIsSending(false);
		}
	};

	const handleMarkAsRead = async (messageId: string) => {
		try {
			const response = await fetch("/api/messages/mark-read", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ messageId }),
			});

			if (response.ok) {
				await fetchMessages();
			}
		} catch (err) {
			console.error("Failed to mark message as read", err);
		}
	};

	const handleSendReply = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedConversation) return;

		setSendError(null);
		setIsReplyingSending(true);

		try {
			if (!replyMessage.subject.trim()) {
				setSendError("Please enter a subject");
				return;
			}

			if (!replyMessage.content.trim()) {
				setSendError("Please enter message content");
				return;
			}

			const selectedConv = conversations.find(
				(c) => c.userId === selectedConversation
			);
			if (!selectedConv) {
				setSendError("Could not find conversation");
				return;
			}

			const response = await fetch("/api/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					recipientId: selectedConversation,
					recipientName: selectedConv.userName,
					subject: replyMessage.subject,
					content: replyMessage.content,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to send message");
			}

			// Reset reply form and refresh messages
			setReplyMessage({
				subject: "",
				content: "",
			});
			await fetchMessages();
		} catch (err) {
			console.error("Failed to send reply", err);
			setSendError(
				err instanceof Error ? err.message : "Failed to send message"
			);
		} finally {
			setIsReplyingSending(false);
		}
	};

	const conversationMessages = selectedConversation
		? messages.filter(
				(msg) =>
					(msg.senderId === currentUserId &&
						msg.recipientId === selectedConversation) ||
					(msg.senderId === selectedConversation &&
						msg.recipientId === currentUserId)
			)
		: [];

	if (isLoading) {
		return (
			<section className="space-y-4">
				<h1 className="text-2xl font-semibold">Messages</h1>
				<p className="text-slate-400">Loading messages...</p>
			</section>
		);
	}

	if (error) {
		return (
			<section className="space-y-4">
				<h1 className="text-2xl font-semibold">Messages</h1>
				<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
					<p className="text-red-400">{error}</p>
				</div>
				<button
					onClick={fetchMessages}
					className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				>
					Try Again
				</button>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Messages</h1>
				<button
					onClick={() => setIsComposing(true)}
					className="rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
				>
					New Message
				</button>
			</div>

			{isComposing && (
				<div className="rounded-lg border border-white/10 bg-slate-900 p-6">
					<h2 className="mb-4 text-xl font-semibold">Compose Message</h2>
					<form onSubmit={handleSendMessage} className="space-y-4">
						<input
							type="hidden"
							id="recipientId"
							value={newMessage.recipientId}
							onChange={(e) =>
								setNewMessage({
									...newMessage,
									recipientId: e.target.value,
								})
							}
						/>
						<div>
							<label
								htmlFor="recipientName"
								className="block text-sm font-medium text-slate-300"
							>
								Recipient Name
							</label>
							<input
								type="text"
								id="recipientName"
								value={newMessage.recipientName}
								onChange={(e) =>
									setNewMessage({
										...newMessage,
										recipientName: e.target.value,
									})
								}
								className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-slate-100"
								placeholder="Enter recipient name"
							/>
						</div>
						<div>
							<label
								htmlFor="subject"
								className="block text-sm font-medium text-slate-300"
							>
								Subject
							</label>
							<input
								type="text"
								id="subject"
								value={newMessage.subject}
								onChange={(e) =>
									setNewMessage({
										...newMessage,
										subject: e.target.value,
									})
								}
								className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-slate-100"
								placeholder="Enter subject"
							/>
						</div>
						<div>
							<label
								htmlFor="content"
								className="block text-sm font-medium text-slate-300"
							>
								Message
							</label>
							<textarea
								id="content"
								value={newMessage.content}
								onChange={(e) =>
									setNewMessage({
										...newMessage,
										content: e.target.value,
									})
								}
								rows={6}
								className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-slate-100"
								placeholder="Enter your message"
							/>
						</div>
						{sendError && (
							<div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
								<p className="text-sm text-red-400">{sendError}</p>
							</div>
						)}
						<div className="flex gap-3">
							<button
								type="submit"
								disabled={isSending}
								className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
							>
								{isSending ? "Sending..." : "Send Message"}
							</button>
							<button
								type="button"
								onClick={() => {
									setIsComposing(false);
									setSendError(null);
								}}
								className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			<div className="grid gap-6 md:grid-cols-3">
				{/* Conversations List */}
				<div className="rounded-lg border border-white/10 bg-slate-900 p-4 md:col-span-1">
					<h2 className="mb-4 text-lg font-semibold">Conversations</h2>
					{conversations.length === 0 ? (
						<p className="text-sm text-slate-400">No conversations yet</p>
					) : (
						<div className="space-y-2">
							{conversations.map((conv) => (
								<button
									key={conv.userId}
									onClick={() => setSelectedConversation(conv.userId)}
									className={`w-full rounded-md border p-3 text-left transition ${
										selectedConversation === conv.userId
											? "border-indigo-500 bg-indigo-500/10"
											: "border-white/10 bg-slate-800 hover:bg-slate-700"
									}`}
								>
									<div className="flex items-center justify-between">
										<p className="font-medium text-slate-100">
											{conv.userName}
										</p>
										{conv.unreadCount > 0 && (
											<span className="rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">
												{conv.unreadCount}
											</span>
										)}
									</div>
									<p className="mt-1 truncate text-sm text-slate-400">
										{conv.lastMessage.subject}
									</p>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Messages View */}
				<div className="rounded-lg border border-white/10 bg-slate-900 p-4 md:col-span-2">
					{selectedConversation ? (
						<>
							<h2 className="mb-4 text-lg font-semibold">
								Conversation with{" "}
								{
									conversations.find(
										(c) => c.userId === selectedConversation
									)?.userName
								}
							</h2>
							<div className="space-y-4 mb-6">
								{conversationMessages.length === 0 ? (
									<p className="text-sm text-slate-400">
										No messages in this conversation
									</p>
								) : (
									conversationMessages.map((msg) => (
										<div
											key={msg.id}
											className={`rounded-lg border p-4 ${
												msg.senderId === currentUserId
													? "border-indigo-500/30 bg-indigo-500/10"
													: msg.isRead
														? "border-white/10 bg-slate-800"
														: "border-green-500/30 bg-green-500/10"
											}`}
										>
											<div className="mb-2 flex items-center justify-between">
												<p className="text-sm font-medium text-slate-300">
													{msg.senderId === currentUserId
														? "You"
														: msg.senderName}
												</p>
												<p className="text-xs text-slate-500">
													{new Date(
														msg.createdAt
													).toLocaleDateString()}{" "}
													at{" "}
													{new Date(
														msg.createdAt
													).toLocaleTimeString()}
												</p>
											</div>
											<p className="mb-2 font-semibold text-slate-100">
												{msg.subject}
											</p>
											<p className="text-sm text-slate-300">
												{msg.content}
											</p>
											{msg.recipientId === currentUserId &&
												!msg.isRead && (
													<button
														onClick={() =>
															handleMarkAsRead(msg.id)
														}
														className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
													>
														Mark as read
													</button>
												)}
										</div>
									))
								)}
							</div>

							{/* Reply Form */}
							<div className="rounded-lg border border-white/10 bg-slate-800 p-4">
								<h3 className="mb-3 text-md font-semibold">Reply</h3>
								<form onSubmit={handleSendReply} className="space-y-3">
									<div>
										<label
											htmlFor="replySubject"
											className="block text-sm font-medium text-slate-300 mb-1"
										>
											Subject
										</label>
										<input
											type="text"
											id="replySubject"
											value={replyMessage.subject}
											onChange={(e) =>
												setReplyMessage({
													...replyMessage,
													subject: e.target.value,
												})
											}
											className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
											placeholder={
												conversationMessages.length > 0
													? `Re: ${conversationMessages[conversationMessages.length - 1].subject}`
													: "Enter subject"
											}
										/>
									</div>
									<div>
										<label
											htmlFor="replyContent"
											className="block text-sm font-medium text-slate-300 mb-1"
										>
											Message
										</label>
										<textarea
											id="replyContent"
											value={replyMessage.content}
											onChange={(e) =>
												setReplyMessage({
													...replyMessage,
													content: e.target.value,
												})
											}
											rows={4}
											className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
											placeholder="Type your reply here"
										/>
									</div>
									{sendError && (
										<div className="rounded-md border border-red-500/20 bg-red-500/10 p-2">
											<p className="text-xs text-red-400">
												{sendError}
											</p>
										</div>
									)}
									<button
										type="submit"
										disabled={isReplyingSending}
										className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
									>
										{isReplyingSending ? "Sending..." : "Send Reply"}
									</button>
								</form>
							</div>
						</>
					) : (
						<div className="flex h-full items-center justify-center">
							<p className="text-slate-400">
								Select a conversation to view messages
							</p>
						</div>
					)}
				</div>
			</div>

			{messages.length === 0 && !isComposing && (
				<div className="rounded-lg border border-white/10 bg-slate-900 p-8 text-center">
					<p className="text-slate-400">
						You don&apos;t have any messages yet. Click &quot;New
						Message&quot; to start a conversation!
					</p>
				</div>
			)}
		</section>
	);
}

export default function MessagesPage() {
	return (
		<Suspense
			fallback={
				<section className="space-y-4">
					<h1 className="text-2xl font-semibold">Messages</h1>
					<p className="text-slate-400">Loading messages...</p>
				</section>
			}
		>
			<MessagesContent />
		</Suspense>
	);
}
