import axios from 'axios'
import Environment from '../config/environment.js'
import { type DocumentNode, print } from 'graphql'

class GraphQLService {
  hasuraEndpoint: string
  hasuraAdminSecret: string
  constructor() {
    this.hasuraEndpoint = Environment.config().hasuraEndpoint
    this.hasuraAdminSecret = Environment.config().hasuraAdminSecret
  }

  request = async (query: DocumentNode, variables: any) => {
    const { data } = await axios.post(
      this.hasuraEndpoint + '/v1/graphql',
      {
        query: print(query),
        variables,
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': this.hasuraAdminSecret,
        },
      },
    )

    if (data?.errors?.length) {
      throw new Error(data.errors[0].message)
    }

    const key = Object.keys(data?.data)[0]
    const isArray = Array.isArray(data?.data[key])

    if (isArray) {
      return data?.data[key] || []
    }

    return data?.data[key] || null
  }

  getAuthUser = async (userId: string) => {
    const query = JSON.stringify({
      query: `
        query GetAuthUser($id: uuid!) {
          authUser(id: $id) {
            id
            rawUserMetaData
          }
        }
      `,
      variables: {
        id: userId,
      },
    })

    const { data } = await axios.post(
      this.hasuraEndpoint + '/v1/graphql',
      query,
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': this.hasuraAdminSecret,
        },
      },
    )

    if (data?.errors?.length) {
      throw new Error(data.errors[0].message)
    }

    return data?.data?.authUser || null
  }

  updateAuthUser = async (id: string, rawUserMetaData: any) => {
    const query = JSON.stringify({
      query: `
        mutation UpdateAuthUser($id: uuid!, $rawUserMetaData: jsonb!) {
          updateAuthUser(pk_columns: {id: $id}, _set: {rawUserMetaData: $rawUserMetaData}) {
            id
            rawUserMetaData
          }
        }
      `,
      variables: {
        id,
        rawUserMetaData,
      },
    })

    const { data } = await axios.post(
      this.hasuraEndpoint + '/v1/graphql',
      query,
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': this.hasuraAdminSecret,
        },
      },
    )

    if (data?.errors?.length) {
      throw new Error(data.errors[0].message)
    }

    return data?.data?.updateAuthUser || null
  }

  getUser = async (id: string) => {
    const query = JSON.stringify({
      query: `
        query GetUser($id: uuid!) {
          user(id: $id) {
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
        }
      `,
      variables: {
        id,
      },
    })

    const { data } = await axios.post(
      this.hasuraEndpoint + '/v1/graphql',
      query,
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': this.hasuraAdminSecret,
        },
      },
    )

    if (data?.errors?.length) {
      throw new Error(data.errors[0].message)
    }

    return data?.data?.user || null
  }

  createUser = async ({
    id,
    firstName,
    lastName,
    email,
    phone,
    role,
    moderatorId,
  }: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    moderatorId?: string
  }) => {
    const query = JSON.stringify({
      query: `
        mutation CreateUser(
          $id: uuid!
          $firstName: String!
          $lastName: String!
          $email: String!
          $phone: String!
          $role: String!
          $moderatorId: uuid
        ) {
          createUser(
            object: {
              id: $id
              firstName: $firstName
              lastName: $lastName
              email: $email
              phone: $phone
              role: $role
              moderatorId: $moderatorId
            }
            onConflict: {
              constraint: users_pkey
              updateColumns: [
                firstName
                lastName
                email
                phone
                role
              ]
            }
          ) {
            id
            firstName
            lastName
            fullName
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
        }
      `,
      variables: {
        id,
        firstName,
        lastName,
        email,
        phone,
        role,
        moderatorId,
      },
    })

    const { data } = await axios.post(
      this.hasuraEndpoint + '/v1/graphql',
      query,
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': this.hasuraAdminSecret,
        },
      },
    )

    if (data?.errors?.length) {
      throw new Error(data.errors[0].message)
    }

    return data?.data?.createUser || null
  }
}

export default GraphQLService
