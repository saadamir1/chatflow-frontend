import { gql } from "@apollo/client";

export const USERS_QUERY = gql`
  query {
    users {
      id
      firstName
      lastName
      email
    }
  }
`;

// Authentication mutations
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      access_token
      refresh_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
  ) {
    register(
      registerInput: {
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      message
    }
  }
`;

export const BOOTSTRAP_ADMIN = gql`
  mutation BootstrapAdmin(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
  ) {
    bootstrapAdmin(
      bootstrapInput: {
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      access_token
      refresh_token
    }
  }
`;

// User queries
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

// Notification operations
export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification(
    $title: String!
    $message: String!
    $type: String!
    $userId: Float!
  ) {
    createNotification(
      createNotificationInput: {
        title: $title
        message: $message
        type: $type
        userId: $userId
      }
    ) {
      id
      title
      message
    }
  }
`;

export const MY_NOTIFICATIONS = gql`
  query {
    myNotifications {
      id
      title
      message
      type
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

// Chat operations
export const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!, $participantIds: [Float!]!) {
    createRoom(
      createRoomInput: { name: $name, participantIds: $participantIds }
    ) {
      id
      name
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($content: String!, $roomId: Float!) {
    sendMessage(sendMessageInput: { content: $content, roomId: $roomId }) {
      id
      content
      senderId
      sender {
        firstName
        lastName
      }
      createdAt
      roomId
    }
  }
`;

export const MY_ROOMS = gql`
  query {
    myRooms {
      id
      name
      participants {
        id
        firstName
        lastName
        email
      }
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

// Subscriptions
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
