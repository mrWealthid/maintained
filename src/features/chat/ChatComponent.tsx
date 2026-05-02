"use client";
import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  MoreVertical,
  UserPlus,
  Phone,
  Video,
  Info,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  ArrowLeft,
  ImageIcon,
  File,
  Download,
  Menu,
  X,
  Trash2,
  Edit2,
  Check,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/Theme-Toggle";
import {
  useDeleteMessage,
  useEditMessage,
  useFetchChatRoomMessages,
  useFetchChatRooms,
  useSendMessage,
} from "./hooks/chatHooks";
import { ChatRoom, ChatRoomMessage, Participant } from "./model/chat.model";
import { CHAT_MSG_DELIVERY_STATUS, CHAT_ROLES } from "./data/enums";
import {
  computeDeliveryState,
  formatDate,
  formatTime,
  getPriorityColor,
  getRoleColor,
  getStatusColor,
} from "./helper/helper";

import { usePusherChatRoom } from "./hooks/usePusherChat";
import { TypingIndicator } from "./components/TypingIndicator";
import { useBottomSentinel } from "./hooks/interfaceHooks";
import { MessageListSkeleton } from "./components/MessageListSkeleton";
import { EmptyChatState } from "./components/EmptyChatState";
import { EmptyRoomsState } from "./components/EmptyRoomsState";
import { useFetchTechnicians } from "../tickets/hooks/ticketHooks";
import { getMembershipForBusiness } from "@/utils/helpers";
import { useAppContext } from "../../shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";

// const mockTechnicians = [
//   {
//     id: "tech-1",
//     name: "Mike Rodriguez",
//     specialty: "Plumbing",
//     avatar: "/placeholder.svg?height=40&width=40&text=MR",
//   },
//   {
//     id: "tech-2",
//     name: "Lisa Chen",
//     specialty: "Electrical",
//     avatar: "/placeholder.svg?height=40&width=40&text=LC",
//   },
//   {
//     id: "tech-3",
//     name: "David Wilson",
//     specialty: "HVAC",
//     avatar: "/placeholder.svg?height=40&width=40&text=DW",
//   },
// ];

const chatRoleMap = {
  [CHAT_ROLES.REQUESTER]: "Tenant",
  [CHAT_ROLES.ADMIN]: "Admin",
  [CHAT_ROLES.TECHNICIAN]: "Technician",
};

export default function ChatComponent() {
  const { user } = useAppContext();
  const canSendChat = useHasPermission(PERMISSION.CHAT_SEND);
  const { isFetchingRooms, rooms = [], roomsError } = useFetchChatRooms();
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  const {
    mutate: sendMessage,
    isPending,
    error,
  } = useSendMessage(currentRoom?.id!, user!);

  const {
    isFetchingMessages,
    messages,
    error: messagesError,
  } = useFetchChatRoomMessages(1, 50, currentRoom?.id!);

  usePusherChatRoom(currentRoom?.id);

  const bottomRef = useBottomSentinel(currentRoom?.id!, messages.at(-1)?._id);

  const { mutate: editMessage } = useEditMessage(currentRoom?.id!);
  const { mutate: deleteMessage } = useDeleteMessage(currentRoom?.id!);

  const { typingUsers, emitTyping } = usePusherChatRoom(
    currentRoom?.id,
    user?.id
  );

  const { data: technicians } = useFetchTechnicians();
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [showAddTechnician, setShowAddTechnician] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentRoom(rooms[0]);
  }, [rooms]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const trimMessage = newMessage.trim();
    if (!trimMessage) return;

    sendMessage(trimMessage);
    setNewMessage("");
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    const updatedValue = editingContent.trim();
    if (!updatedValue || !editingMessageId) return;

    editMessage({ text: updatedValue, id: editingMessageId });
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage({ id: messageId });
    setDeleteMessageId(null);
  };

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setNewMessage(e.target.value);
    emitTyping(true);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitTyping(false);
      typingTimer.current = null;
    }, 1200);
  }
  const handleAddTechnician = () => {
    if (!selectedTechnician) return;

    const technician = technicians?.find((t) => t.id === selectedTechnician);
    if (!technician) return;

    setSelectedTechnician("");
    setShowAddTechnician(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Handle file upload logic here
    console.log("Files selected:", files);
  };

  function generateAvatar(fullName: string) {
    const placeholder = "/placeholder.svg?height=40&width=40&text=$";
    const abbreviation = fullName
      .split(" ")
      .map((name) => name[0])
      .join("");

    return placeholder.replace("$", abbreviation);
  }

  /** Render ticks ONLY for the current user's own messages */
  function renderMessageStatus(
    message: ChatRoomMessage,
    meId: string,
    participants: Participant[]
  ) {
    if (!message.sender || message.sender.id !== meId) return null;

    const state = computeDeliveryState(message, participants);

    const statusJSXMap = {
      [CHAT_MSG_DELIVERY_STATUS.SENDING]: (
        <div className="flex items-center space-x-1">
          <RefreshCw
            className="h-3 w-3 animate-spin text-muted-foreground"
            strokeWidth={1.5}
          />
          {/* <span className="text-xs capitalize text-muted-foreground">
            {CHAT_MSG_DELIVERY_STATUS.SENDING}…
          </span> */}
        </div>
      ),
      [CHAT_MSG_DELIVERY_STATUS.SENT]: (
        <div className="flex items-center space-x-1">
          <Check className="h-3 w-3 text-muted-foreground" />
          {/* <span className="text-xs capitalize text-muted-foreground">
            {CHAT_MSG_DELIVERY_STATUS.SENT}
          </span> */}
        </div>
      ),
      [CHAT_MSG_DELIVERY_STATUS.READ]: (
        <div className="flex items-center space-x-1">
          <CheckCheck className="h-3 w-3 " color="#4965ee" strokeWidth={1.5} />
          {/* <span className="text-xs capitalize text-primary">
            {CHAT_MSG_DELIVERY_STATUS.READ}
          </span> */}
        </div>
      ),
      [CHAT_MSG_DELIVERY_STATUS.DELIVERED]: (
        <div className="flex items-center space-x-1">
          <CheckCheck className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
          {/* <span className="text-xs capitalize text-muted-foreground">
            {CHAT_MSG_DELIVERY_STATUS.DELIVERED}
          </span> */}
        </div>
      ),
    };

    return (
      <div className="flex items-center space-x-1 mt-1">
        {statusJSXMap[state]}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex h-screen bg-muted/40 dark:bg-background">
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-background px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-lg font-semibold text-foreground">
                  Maintenance Chat
                </h1>
              </div>
            </div>
          </header>
          <EmptyRoomsState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-muted/40 dark:bg-background">
      <div
        className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden border-r border-border bg-card flex flex-col`}
      >
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Tickets
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms?.map((room) => {
            const { title, priority, status } = room.ticket;
            return (
              <div
                key={room.id}
                onClick={() => setCurrentRoom(room)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                  currentRoom?.id === room.id
                    ? "bg-primary/5 dark:bg-primary/20/20 border-l-4 border-l-primary"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {title}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      {/* {room.id} */}
                      {room.ticket.propertyName} • {room.ticket.unitLabel}
                    </p>
                  </div>
                  {/* {
                    <Badge className="bg-destructive text-white text-xs px-2 py-1 rounded-full">
                      {3}
                    </Badge>
                  } */}
                  {/* {room.unreadCount > 0 && (
                    <Badge className="bg-destructive text-white text-xs px-2 py-1 rounded-full">
                      {room.unreadCount}
                    </Badge>
                  )} */}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStatusColor(status)} variant="secondary">
                    {status.replace("_", " ")}
                  </Badge>
                  <span
                    className={`text-xs font-medium ${getPriorityColor(priority)}`}
                  >
                    {priority}
                  </span>
                </div>
                {/* <p className="text-xs text-muted-foreground truncate">
                  {room.lastMessage}
                // </p> */}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(room.updatedAt.toString())}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!currentRoom?.id ? (
          <>
            <header className="border-b border-border bg-background px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <h1 className="text-lg font-semibold text-foreground">
                    Maintenance Chat
                  </h1>
                </div>
              </div>
            </header>
            <EmptyChatState />
          </>
        ) : (
          <>
            {/* Header */}
            <header className="border-b border-border bg-background px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-foreground">
                        {currentRoom?.ticket.title}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {currentRoom.ticket.propertyName} •
                        {currentRoom.ticket.unitLabel}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getStatusColor(currentRoom?.ticket.status!)}
                  >
                    {currentRoom?.ticket.status.replace("_", " ")}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Info className="h-4 w-4 mr-2" />
                        Request Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Tenant
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Request Info Bar */}
                <div className="border-b border-border bg-card p-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {/* Created {formatDate(currentRoom?.createdAt.toString()!)} */}
                          Created{" "}
                          {formatDate(currentRoom?.updatedAt.toString()!)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-status-open" />
                        <Badge
                          variant={"outline"}
                          className={`text-sm font-medium ${getPriorityColor(currentRoom?.ticket.priority!)}`}
                        >
                          {currentRoom?.ticket.priority!}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {currentRoom?.ticket.category.name}
                      </Badge>
                    </div>
                  </div>
                </div>

                {isFetchingMessages ? (
                  <MessageListSkeleton />
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages?.map((message) => (
                      <div key={message._id} className="flex space-x-3 group">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage
                            src={generateAvatar(
                              message.sender?.name || "SYSTEM"
                            )}
                          />
                          <AvatarFallback>
                            {message.sender?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "SY"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {message.sender?.name || "SYSTEM"}
                            </span>
                            {/* <Badge
                        className={`text-xs ${getRoleColor(message.sender.)}`}
                      >
                        {message.senderRole}
                      </Badge> */}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.createdAt.toString())}
                            </span>

                            {canSendChat &&
                              message.sender &&
                              message.sender.id === user?.id && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleEditMessage(
                                        message._id,
                                        message.text!
                                      )
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteMessageId(message._id)
                                    }
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                          </div>
                          <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                            {editingMessageId === message._id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingContent}
                                  onChange={(e) =>
                                    setEditingContent(e.target.value)
                                  }
                                  className="min-h-[60px] resize-none"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit();
                                    }
                                    if (e.key === "Escape") {
                                      handleCancelEdit();
                                    }
                                  }}
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSaveEdit}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {message.text}
                                </p>
                                {renderMessageStatus(
                                  message,
                                  user?.id!,
                                  currentRoom?.participants!
                                )}
                              </>
                            )}
                            {/* {message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center space-x-2 p-2 bg-muted/40 dark:bg-muted rounded border"
                            >
                              {attachment.type === "image" ? (
                                <ImageIcon className="h-4 w-4 text-primary" />
                              ) : (
                                <File className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-foreground flex-1">
                                {attachment.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {attachment.size}
                              </span>
                              <Button variant="ghost" size="sm">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )} */}
                          </div>
                        </div>
                      </div>
                    ))}

                    <TypingIndicator
                      typingUsers={typingUsers}
                      participants={currentRoom?.participants!}
                      meId={user?.id!}
                    />
                    <div ref={bottomRef} />

                    <div ref={messagesEndRef} />
                  </div>
                )}

                {canSendChat && (
                  <div className="border-t border-border bg-card p-4 flex-shrink-0 sticky bottom-0">
                    {" "}
                    <div className="flex space-x-2">
                      <input
                        title="Upload files"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Textarea
                        value={newMessage}
                        onChange={onChange}
                        placeholder="Type your message..."
                        className="flex-1 min-h-[40px] max-h-32 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="flex-shrink-0 bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {currentRoom.id && (
                <div className="w-80 border-l border-border bg-card overflow-hidden flex flex-col h-full">
                  {" "}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Participants */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        Participants ({currentRoom?.participants.length})
                      </h3>
                      <div className="space-y-3">
                        {currentRoom?.participants.map((participant, i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={
                                  generateAvatar(participant.user.name) ||
                                  "/placeholder.svg"
                                }
                              />
                              <AvatarFallback>
                                {participant.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {participant.user.name}
                              </p>
                              {participant.role === CHAT_ROLES.REQUESTER ? (
                                <p className="text-xs text-muted-foreground">
                                  {chatRoleMap[participant.role]} •{" "}
                                  {currentRoom.ticket.propertyName} •{" "}
                                  {currentRoom.ticket.unitLabel}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  {" "}
                                  {chatRoleMap[participant.role]}
                                </p>
                              )}
                            </div>
                            <Badge className={getRoleColor(participant.role)}>
                              {chatRoleMap[participant.role]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Request Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        Request Details
                      </h3>
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Description
                            </label>
                            <p className="text-sm text-foreground mt-1">
                              {currentRoom?.ticket.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs block font-medium text-muted-foreground uppercase tracking-wide">
                                Priority
                              </label>
                              <Badge
                                variant={"outline"}
                                className={`text-sm font-medium mt-1 ${getPriorityColor(currentRoom?.ticket.priority!)}`}
                              >
                                {currentRoom?.ticket.priority}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Category
                              </label>
                              <p className="text-sm text-foreground mt-1">
                                {currentRoom?.ticket.category.name}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs block font-medium text-muted-foreground uppercase tracking-wide">
                              Status
                            </label>
                            <Badge
                              className={`mt-1 ${getStatusColor(currentRoom?.ticket.status!)}`}
                            >
                              {currentRoom?.ticket.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        Quick Actions
                      </h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          size="sm"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Tenant
                        </Button>

                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ActionConfirmDialog
        open={!!deleteMessageId}
        onOpenChange={(open) => {
          if (!open) setDeleteMessageId(null);
        }}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        icon={Trash2}
        onConfirm={() => {
          if (deleteMessageId) handleDeleteMessage(deleteMessageId);
        }}
      />
    </div>
  );
}
