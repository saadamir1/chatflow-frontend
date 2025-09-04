import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      refresh_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      access_token
      refresh_token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const GET_MY_WORKSPACE = gql`
  query GetMyWorkspace {
    myWorkspace {
      id
      name
      slug
      users {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_BILLING_SUBSCRIPTION = gql`
  query GetBillingSubscription {
    myBillingSubscription {
      id
      planType
      status
      amount
      currentPeriodEnd
    }
  }
`;

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($createPaymentIntentInput: CreatePaymentIntentInput!) {
    createPaymentIntent(createPaymentIntentInput: $createPaymentIntentInput) {
      clientSecret
      paymentIntentId
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($sendMessageInput: SendMessageInput!) {
    sendMessage(sendMessageInput: $sendMessageInput) {
      id
      content
      createdAt
      sender {
        firstName
        lastName
      }
    }
  }
`;

export const MESSAGE_SUBSCRIPTION = gql`
  subscription MessageAdded {
    messageAdded {
      id
      content
      senderId
      roomId
      createdAt
    }
  }
`;