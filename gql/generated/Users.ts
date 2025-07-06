import { gql } from 'graphql-tag'

const UserFragment = gql`
  fragment UserFragment on Users {
    id
    firstName
    lastName
    email
    phone
    avatarUrl
    bio
    isDeleted
    role
    suspended
    lastNameChangedAt
    moderatorId
    createdAt
    updatedAt
  }
`

const GetUsers = gql`
  # Query to get Users with pagination
  query GetUsers(
    $limit: Int!
    $offset: Int!
    $orderBy: [UsersOrderBy!]
    $filter: UsersBoolExp
  ) {
    users(limit: $limit, offset: $offset, orderBy: $orderBy, where: $filter) {
      ...UserFragment
    }
    total: usersAggregate(where: $filter) {
      aggregate {
        count
      }
    }
  }
  ${UserFragment}
`

const GetUser = gql`
  # Query to get one User
  query GetUser($id: uuid!) {
    user(id: $id) {
      ...UserFragment
    }
  }
  ${UserFragment}
`

const CreateUser = gql`
  # Mutation to create one User
  mutation CreateUser(
    $firstName: String!
    $lastName: String
    $email: String!
    $phone: String!
    $avatarUrl: String
    $bio: String
    $isDeleted: Boolean
    $role: TypesUserRolesEnum!
    $suspended: Boolean
    $lastNameChangedAt: date
    $moderatorId: uuid
  ) {
    createUser(
      object: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        phone: $phone
        avatarUrl: $avatarUrl
        bio: $bio
        isDeleted: $isDeleted
        role: $role
        suspended: $suspended
        lastNameChangedAt: $lastNameChangedAt
        moderatorId: $moderatorId
      }
    ) {
      ...UserFragment
    }
  }
  ${UserFragment}
`

const UpdateUser = gql`
  # Mutation to update one User
  mutation UpdateUser(
    $id: uuid!
    $firstName: String!
    $lastName: String
    $email: String!
    $phone: String!
    $avatarUrl: String
    $bio: String
    $isDeleted: Boolean
    $role: TypesUserRolesEnum!
    $suspended: Boolean
    $lastNameChangedAt: date
    $moderatorId: uuid
  ) {
    updateUser(
      _set: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        phone: $phone
        avatarUrl: $avatarUrl
        bio: $bio
        isDeleted: $isDeleted
        role: $role
        suspended: $suspended
        lastNameChangedAt: $lastNameChangedAt
        moderatorId: $moderatorId
      }
      pk_columns: { id: $id }
    ) {
      ...UserFragment
    }
  }
  ${UserFragment}
`

const DeleteUser = gql`
  # Mutation to delete one User
  mutation DeleteUser($id: uuid!) {
    deleteUser(id: $id) {
      ...UserFragment
    }
  }
  ${UserFragment}
`

const GetAllUsers = gql`
  # Query to get all Users without pagination (DO NOT USE THIS IN PRODUCTION!!!)
  query GetAllUsers {
    users {
      ...UserFragment
    }
  }
  ${UserFragment}
`

const DeleteAllUsers = gql`
  # Mutation to delete all Users
  mutation DeleteAllUsers {
    deleteUsers(where: {}) {
      affected_rows
    }
  }
  ${UserFragment}
`

export default {
  GetUsers,
  GetUser,
  CreateUser,
  UpdateUser,
  DeleteUser,
  GetAllUsers,
  DeleteAllUsers,
}
