import React, {Component} from 'react';
import {Button, Card} from 'react-bootstrap';
import {FaTrash} from 'react-icons/fa';
import StackGrid from 'react-stack-grid';
import sizeMe from 'react-sizeme';

class ListBookmarks extends Component {
  constructor(props) {
    super(props);
  }

  truncate(s, max) {
    if (s.length > max) {
      s = s.slice(0, max) + "...";
    }
    return s;
  }

  render() {
    const {bookmarks, isLoading, tag, deleteBookmark, size} = this.props;
    const { width} = size;
    return (
      <div className="col-md-12 bookmarks">
        <br/>
        <p className="h3" style={{textTransform: 'capitalize'}}>{tag} Bookmarks</p>
        <br/>
        {isLoading && <span>Fetching Bookmarks...</span>}
        <StackGrid columnWidth={width <= 768 ? '100%' : '33.33%'} gutterWidth={10} gutterHeight={10} duration={0}>
          {bookmarks.filter(bookmark => bookmark.tags.includes(tag) || tag === "all").map((bookmark) => (

            <Card key={bookmark.id + width}>
              <Card.Body>
                <Card.Title style={{textTransform: 'capitalize'}}>{this.truncate(bookmark.title, 100)}</Card.Title>
                <Card.Text>
                  {this.truncate(bookmark.description, 200)}
                </Card.Text>
                <Card.Text>
                  Tag: {this.truncate(bookmark.tags, 100)}
                </Card.Text>
                <Button variant="primary" href={bookmark.url} target="_blank">View</Button>
                <div style={{float: 'right'}}>
                  <FaTrash onClick={e => deleteBookmark(e, bookmark.id)} style={{cursor: 'pointer'}}/>
                </div>
              </Card.Body>
            </Card>
            )
          )}
        </StackGrid>
        {!isLoading && !bookmarks.length && <span>Add a bookmark to get started</span>}
        <br/>
      </div>
    )
  }
}

export default sizeMe({monitorHeight: true})(ListBookmarks);
