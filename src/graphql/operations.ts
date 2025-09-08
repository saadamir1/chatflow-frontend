import { gql } from "@apollo/client";

// ============= AUTH OPERATIONS =============
export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      access_token
      refresh_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: CreateUserInput!) {
    register(registerInput: $registerInput) {
      message
    }
  }
`;

export const BOOTSTRAP_ADMIN = gql`
  mutation BootstrapAdmin($bootstrapInput: CreateUserInput!) {
    bootstrapAdmin(bootstrapInput: $bootstrapInput) {
      access_token
      refresh_token
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {
    refreshToken(refreshTokenInput: $refreshTokenInput) {
      access_token
      refresh_token
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($forgotPasswordInput: ForgotPasswordInput!) {
    forgotPassword(forgotPasswordInput: $forgotPasswordInput) {
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($resetPasswordInput: ResetPasswordInput!) {
    resetPassword(resetPasswordInput: $resetPasswordInput) {
      message
    }
  }
`;

// ============= USER OPERATIONS =============
export const USERS_QUERY = gql`
  query {
    users {
      id
      firstName
      lastName
      email
      role
    }
  }
`;

export const GET_ME = gql`
  query {
    me {
      id
      email
      firstName
      lastName
      role
    }
  }
`;

export const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      role
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($updateProfileInput: UpdateProfileInput!) {
    updateProfile(updateProfileInput: $updateProfileInput) {
      id
      firstName
      lastName
      email
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($changePasswordInput: ChangePasswordInput!) {
    changePassword(changePasswordInput: $changePasswordInput)
  }
`;

// ============= CHAT OPERATIONS =============
export const MY_ROOMS = gql`
  query {
    myRooms {
      id
      name
      type
      participants {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const MY_CHANNELS = gql`
  query {
    myChannels {
      id
      name
      type
      adminId
      isPrivate
      description
      participants {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const MY_DIRECT_MESSAGES = gql`
  query {
    myDirectMessages {
      id
      name
      type
      adminId
      participants {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const DISCOVER_CHANNELS = gql`
  query {
    discoverChannels {
      id
      name
      description
      isPrivate
      adminId
    }
  }
`;

export const ROOM_MESSAGES = gql`
  query RoomMessages($roomId: Float!) {
    roomMessages(roomId: $roomId) {
      id
      content
      senderId
      sender {
        firstName
        lastName
      }
      createdAt
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation CreateRoom($createRoomInput: CreateRoomDto!) {
    createRoom(createRoomInput: $createRoomInput) {
      id
      name
      type
      adminId
      isPrivate
      description
    }
  }
`;

export const CREATE_DIRECT_MESSAGE = gql`
  mutation CreateDirectMessage($otherUserId: Float!) {
    createDirectMessage(otherUserId: $otherUserId) {
      id
      name
      type
      participants {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($sendMessageInput: SendMessageDto!) {
    sendMessage(sendMessageInput: $sendMessageInput) {
      id
      content
      senderId
      roomId
      createdAt
      sender {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

// ============= NOTIFICATION OPERATIONS =============
export const MY_NOTIFICATIONS = gql`
  query {
    myNotifications {
      id
      title
      message
      type
      referenceId
      referenceType
      read
      createdAt
    }
  }
`;

export const UNREAD_COUNT = gql`
  query {
    unreadCount
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($createNotificationInput: CreateNotificationDto!) {
    createNotification(createNotificationInput: $createNotificationInput) {
      id
      title
      message
      type
      userId
      read
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: Float!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: Float!) {
    deleteNotification(id: $id)
  }
`;

// ============= WORKSPACE OPERATIONS =============
export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($createWorkspaceInput: CreateWorkspaceInput!) {
    createWorkspace(createWorkspaceInput: $createWorkspaceInput) {
      id
      name
      slug
      description
    }
  }
`;

export const WORKSPACES_QUERY = gql`
  query {
    workspaces {
      id
      name
      slug
      description
    }
  }
`;

export const WORKSPACE_QUERY = gql`
  query Workspace($id: Int!) {
    workspace(id: $id) {
      id
      name
      slug
      description
    }
  }
`;

export const WORKSPACE_BY_SLUG = gql`
  query WorkspaceBySlug($slug: String!) {
    workspaceBySlug(slug: $slug) {
      id
      name
      slug
      description
    }
  }
`;

export const MY_WORKSPACE = gql`
  query {
    myWorkspace {
      id
      name
      slug
      description
    }
  }
`;

// ============= INVITATION OPERATIONS =============
export const INVITE_USER = gql`
  mutation InviteUser($inviteUserInput: InviteUserInput!) {
    inviteUser(inviteUserInput: $inviteUserInput) {
      success
      message
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token) {
      success
      message
    }
  }
`;

export const WORKSPACE_INVITATIONS = gql`
  query {
    workspaceInvitations {
      id
      email
      status
      createdAt
    }
  }
`;

// ============= SUBSCRIPTIONS =============
export const MESSAGE_SUBSCRIPTION = gql`
  subscription {
    messageAdded {
      id
      content
      senderId
      sender {
        firstName
        lastName
      }
      roomId
      createdAt
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription {
    notificationAdded {
      id
      title
      message
      type
      userId
      read
      createdAt
    }
  }
`;

// ============= CHANNEL JOIN FLOW =============
export const REQUEST_JOIN = gql`
  mutation RequestJoin($requestJoinInput: RequestJoinInput!) {
    requestToJoin(requestJoinInput: $requestJoinInput) {
      id
      roomId
      requesterId
      status
      createdAt
    }
  }
`;

export const APPROVE_JOIN = gql`
  mutation ApproveJoin($approveJoinInput: ApproveJoinInput!) {
    approveJoin(approveJoinInput: $approveJoinInput) {
      id
      roomId
      requesterId
      status
      createdAt
    }
  }
`;

export const REJECT_JOIN = gql`
  mutation RejectJoin($rejectJoinInput: RejectJoinInput!) {
    rejectJoin(rejectJoinInput: $rejectJoinInput) {
      id
      roomId
      requesterId
      status
      createdAt
    }
  }
`;

export const DELETE_ROOMS = gql`
  mutation DeleteRooms($deleteRoomsInput: DeleteRoomsInput!) {
    deleteRooms(deleteRoomsInput: $deleteRoomsInput)
  }
`;