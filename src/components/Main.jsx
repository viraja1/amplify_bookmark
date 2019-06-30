import React, {Component} from 'react';

import {Route, BrowserRouter} from 'react-router-dom';
import SideNav, {NavItem, NavIcon, NavText} from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import {FaHome, FaPlusCircle} from 'react-icons/fa';

import AddBookmark from './AddBookmark.jsx';
import ListBookmarks from './ListBookmarks.jsx';


// import API & graphqlOperation helpers from AWS Amplify
import {API, graphqlOperation, Auth} from 'aws-amplify';

// import the mutations & queries we'll need to interact with the API
import {createBookmark, deleteBookmark} from '../graphql/mutations';
import {listBookmarks} from '../graphql/queries';

export default class Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newBookmark: {
        title: '',
        description: '',
        url: '',
        tags: [],
        owner: ''
      },
      bookmarks: [],
      tags: [],
      isLoading: false,
      expanded: false,
      error: '',
      user: {}
    };
  }

  updateBookmark(key, value) {
    const bookmark = this.state.newBookmark;
    if (key === "tags") {
      value = [value];
    }
    bookmark[key] = value;
    this.setState({
      newBookmark: bookmark
    })
  }

  deleteBookmark(event, id) {
    const input = {id: id};
    const updatedBookmarks = this.state.bookmarks.filter(bookmark => {
      return bookmark.id !== id;
    });
    API.graphql(graphqlOperation(deleteBookmark, {input}))
      .then(() => {
        this.setState({
          bookmarks: updatedBookmarks
        })
      })

  }

  handleNewBookmarkSubmit(event, history) {
    let newBookmark = this.state.newBookmark;
    let url_regex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g;
    if (typeof newBookmark.title === "undefined" || newBookmark.title.trim() === "") {
      this.setState({error: "Valid title is required"});
      return;
    }
    if (typeof newBookmark.description === "undefined" || newBookmark.description.trim() === "") {
      this.setState({error: "Valid description is required"});
      return;
    }
    if (typeof newBookmark.url === "undefined" || newBookmark.url.trim() === "" || !newBookmark.url.match(url_regex)) {
      this.setState({error: "Valid url is required"});
      return;
    }
    if (typeof newBookmark.tags[0] === "undefined" || newBookmark.tags[0].trim() === "") {
      this.setState({error: "Valid tag is required"});
      return;
    }
    if (newBookmark.tags[0].trim().length > 100) {
      this.setState({error: "Tag length should not exceed more than 100 characters"});
      return;
    }
    this.setState({error: ''});
    this.saveNewBookmark(newBookmark);
    this.setState({
      newBookmark: {
        title: '',
        description: '',
        url: '',
        tags: [],
        owner: ''
      }
    });
    history.push('/home');
  }

  saveNewBookmark(newBookmark) {
    let bookmarks = this.state.bookmarks;
    let tags = this.state.tags;

    newBookmark.owner = this.state.user.getUsername();

    bookmarks.unshift(newBookmark);
    if (!tags.includes(newBookmark.tags[0])) {
      tags.push(newBookmark.tags[0]);
    }
    API.graphql(graphqlOperation(createBookmark, {input: newBookmark}))
      .then(() => {
        this.setState({
          bookmarks: bookmarks,
          tags: tags
        })
      });
  }

  fetchData() {
    this.setState({isLoading: true});
    API.graphql(graphqlOperation(listBookmarks, {
      filter: {
        owner: {
          eq: this.state.user.getUsername()
        }
      }
    }))
      .then(({data: {listBookmarks: {items}}}) => {
        let bookmarks = items;
        let tags = bookmarks.map(b => b.tags[0]);
        tags = Array.from(new Set(tags));
        this.setState({
          bookmarks: bookmarks,
          tags: tags
        })
      })
      .finally(() => {
        this.setState({isLoading: false})
      })
  }

  onToggle(expanded) {
    this.setState({expanded: expanded});
  }

  truncate(s, max) {
    if (s.length > max) {
      s = s.slice(0, max) + "...";
    }
    return s;
  }

  render() {
    const {expanded, bookmarks, tags, isLoading, error} = this.state;
    return (
      <BrowserRouter>
        <Route render={({location, history}) => (
          <React.Fragment>
            <div className="site-sub-wrapper">
              <SideNav className="side-nav"
                       onSelect={(selected) => {
                         const to = '/' + selected;
                         if (location.pathname !== to) {
                           history.push(to);
                         }
                       }}
                       onToggle={this.onToggle.bind(this)}
              >
                <SideNav.Toggle/>
                <SideNav.Nav selected={location.pathname.replace('/', '')} className="side-nav-sub">
                  <NavItem eventKey="home">
                    <NavIcon>
                      <FaHome/>
                    </NavIcon>
                    <NavText>
                      Home
                    </NavText>
                  </NavItem>
                  <NavItem eventKey="add_bookmark">
                    <NavIcon>
                      <FaPlusCircle/>
                    </NavIcon>
                    <NavText>
                      New Bookmark
                    </NavText>
                  </NavItem>
                  {tags.filter(tag => typeof tag !== "undefined" && tag.trim() !== "").map((tag) => (
                      <NavItem eventKey={tag} key={'nav_' + tag}>
                        <NavIcon>

                        </NavIcon>
                        <NavText>
                          {this.truncate(tag, 20)}
                        </NavText>
                      </NavItem>

                    )
                  )}
                </SideNav.Nav>
              </SideNav>
              <main style={{
                marginLeft: expanded ? 240 : 64,
                padding: '10px 20px 0 20px'
              }}>
                <Route path="/home" exact render={props => <ListBookmarks
                  bookmarks={bookmarks} isLoading={isLoading} tag="all"
                  deleteBookmark={this.deleteBookmark.bind(this)}/>}/>
                <Route path="/" exact render={props => <ListBookmarks
                  bookmarks={bookmarks} isLoading={isLoading} tag="all"
                  deleteBookmark={this.deleteBookmark.bind(this)}/>}/>
                <Route path="/add_bookmark" render={props => <AddBookmark
                  updateBookmark={this.updateBookmark.bind(this)}
                  handleNewBookmarkSubmit={this.handleNewBookmarkSubmit.bind(this)}
                  newBookmark={this.state.newBookmark} history={history} error={error}/>}/>

                {tags.filter(tag => typeof tag !== "undefined" && tag.trim() !== "").map((tag) => (
                    <Route path={"/" + tag} render={props => <ListBookmarks
                      bookmarks={bookmarks} isLoading={isLoading} tag={tag}
                      deleteBookmark={this.deleteBookmark.bind(this)}/>} key={'route' + tag}/>

                  )
                )}
              </main>
            </div>
          </React.Fragment>
        )}
        />
      </BrowserRouter>
    );
  }


  async componentDidMount() {
    await Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
    .then(user => this.setState({user: user}))
    .then(user => this.fetchData())
    .catch(err => err);
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log(prevState, this.state);
  }

}
