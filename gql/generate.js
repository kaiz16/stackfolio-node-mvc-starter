import fs from 'fs'
import prettierConfig from '../prettier.config.cjs'
import prettier from 'prettier'
import types from './types.json' assert { type: 'json' }

const generate = async (typeToGenerate, isTS = false) => {
  const { singular, plural, fields } = typeToGenerate

  const fileExt = isTS ? 'ts' : 'graphql'

  // Fields
  const cols = fields.map((field) => field.split(':')[0])

  // Generate the fragment
  const fragment = `
${isTS ? `const ${singular}Fragment = gql\`` : ''}
fragment ${singular}Fragment on ${plural} {
    ${cols.join('\n')}
}
${isTS ? '`' : ''}
`

  // Lowercase the first letter of the singular
  const lowerSingular = singular.charAt(0).toLowerCase() + singular.slice(1)
  // Lowercase the first letter of the plural
  const lowerPlural = plural.charAt(0).toLowerCase() + plural.slice(1)

  // Generate the query to get all
  const queryAll = `
${isTS ? `const Get${plural} = gql\`` : ''}
# Query to get ${plural} with pagination
query Get${plural}(
    $limit: Int!
    $offset: Int!
    $orderBy: [${plural}OrderBy!]
    $filter: ${plural}BoolExp
) {
    ${lowerPlural}(
        limit: $limit
        offset: $offset
        orderBy: $orderBy
        where: $filter
    ) {
        ...${singular}Fragment
    }
    total: ${lowerPlural}Aggregate(where: $filter) {
        aggregate {
            count
        }
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  // Generate the query to get one
  const queryOne = `
${isTS ? `const Get${singular} = gql\`` : ''}
# Query to get one ${singular}
query Get${singular}($id: uuid!) {
    ${lowerSingular}(id: $id) {
        ...${singular}Fragment
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  // Generate the mutation to create one
  const mutationCreate = `
${isTS ? `const Create${singular} = gql\`` : ''}
# Mutation to create one ${singular}
mutation Create${singular}(
    ${fields
      .filter(
        (field) =>
          field !== 'id:uuid!' &&
          field !== 'createdAt:timestamptz' &&
          field !== 'updatedAt:timestamptz',
      )
      .map((field) => `$${field.split(':')[0]}: ${field.split(':')[1]}`)
      .join('\n')}
) {
    create${singular}(
        object: {
            ${fields
              .filter(
                (field) =>
                  field !== 'id:uuid!' &&
                  field !== 'createdAt:timestamptz' &&
                  field !== 'updatedAt:timestamptz',
              )
              .map((field) => `${field.split(':')[0]}: $${field.split(':')[0]}`)
              .join('\n')}
        }
    ) {
        ...${singular}Fragment
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  // Generate the mutation to update one
  const mutationUpdate = `
${isTS ? `const Update${singular} = gql\`` : ''}
# Mutation to update one ${singular}
mutation Update${singular}(
    ${fields
      .filter(
        (field) =>
          field !== 'createdAt:timestamptz' &&
          field !== 'updatedAt:timestamptz',
      )
      .map((field) => `$${field.split(':')[0]}: ${field.split(':')[1]}`)
      .join('\n')}
) {
    update${singular}(
        _set: {
            ${fields
              .filter(
                (field) =>
                  field !== 'id:uuid!' &&
                  field !== 'createdAt:timestamptz' &&
                  field !== 'updatedAt:timestamptz',
              )
              .map((field) => `${field.split(':')[0]}: $${field.split(':')[0]}`)
              .join('\n')}
        }
        pk_columns: { id: $id }
    ) {
        ...${singular}Fragment
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  // Generate the mutation to delete one
  const mutationDelete = `
${isTS ? `const Delete${singular} = gql\`` : ''}
# Mutation to delete one ${singular}
mutation Delete${singular}($id: uuid!) {
    delete${singular}(id: $id) {
        ...${singular}Fragment
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  // Generate the query to get all without pagination (DO NOT USE THIS IN PRODUCTION!!!)
  const queryAllWithoutPagination = `
${isTS ? `const GetAll${plural} = gql\`` : ''}
# Query to get all ${plural} without pagination (DO NOT USE THIS IN PRODUCTION!!!)
query GetAll${plural} {
    ${lowerPlural} {
        ...${singular}Fragment
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  // Generate the mutation to delete all
  const mutationDeleteAll = `
${isTS ? `const DeleteAll${plural} = gql\`` : ''}
# Mutation to delete all ${plural}
mutation DeleteAll${plural} {
    delete${plural}(where: {}) {
        affected_rows
    }
}
${isTS ? `$\{${singular}Fragment\}\n\`` : ''}
`

  const exportAll = `
export default {
  Get${plural},
  Get${singular},
  Create${singular},
  Update${singular},
  Delete${singular},
  GetAll${plural},
  DeleteAll${plural},
}
`

  // Write the file
  const gql = `
${isTS ? "import gql from 'graphql-tag'" : ''}

    ${fragment}

    ${queryAll}

    ${queryOne}

    ${mutationCreate}

    ${mutationUpdate}

    ${mutationDelete}

    ${queryAllWithoutPagination}

    ${mutationDeleteAll}
  
${isTS ? exportAll : ''}
    `

  const result = await prettier.format(gql, {
    parser: isTS ? 'typescript' : 'graphql',
    ...prettierConfig,
  })

  fs.writeFileSync(`./generated/${plural}.${fileExt}`, result)
}

for (const type of types) {
  generate(type, false)
  generate(type, true)
}
