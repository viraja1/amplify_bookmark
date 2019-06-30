// eslint-disable
// this is an auto generated file. This will be overwritten

export const getBookmark = `query GetBookmark($id: ID!) {
  getBookmark(id: $id) {
    id
    title
    description
    url
    tags
    owner
  }
}
`;
export const listBookmarks = `query ListBookmarks(
  $filter: ModelBookmarkFilterInput
  $limit: Int
  $nextToken: String
) {
  listBookmarks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      description
      url
      tags
      owner
    }
    nextToken
  }
}
`;
