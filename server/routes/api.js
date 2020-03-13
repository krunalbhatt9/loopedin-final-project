/* eslint-disable consistent-return */
const express = require('express');

const router = express.Router();
// const admin = require('firebase-admin');

// let auth = require('../auth_modules/server_auth');

// Handles all auth before allowing access to API
// router.use(auth);

// eslint-disable-next-line no-unused-vars
const { Post, Message, PostAccess, Test } = require('../models/post.js');

const { User } = require('../models/user.js');

// let { Chat } = require('../models/chat');

const { Loop, UserConnection } = require('../models/loop.js');

// router.route('/login/sessionLogin').post((req, res) => {
//   // Get the ID token passed and the CSRF token.
//   const idToken = req.body.idToken.toString();
//   // const csrfToken = req.body.csrfToken.toString();
//   // // Guard against CSRF attacks.
//   // if (csrfToken !== req.cookies.csrfToken) {
//   //   res.status(401).send('UNAUTHORIZED REQUEST!');
//   //   return;
//   // }
//   console.log(idToken);
//   // Set session expiration to 5 days.
//   const expiresIn = 60 * 60 * 24 * 5 * 1000;

//   admin
//     .auth()
//     .createSessionCookie(idToken, { expiresIn })
//     .then(
//       (sessionCookie) => {
//         // Set cookie policy for session cookie.
//         const options = { maxAge: expiresIn, httpOnly: true, secure: true };
//         res.cookie('session', sessionCookie, options);
//         res.end(JSON.stringify({ status: 'success' }));
//       },
//       (error) => {
//         console.log(error);
//         res.status(401).send('UNAUTHORIZED REQUEST!');
//       },
//     );
// });

router.route('/create-post').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  if (Object.keys(req.body).length === 0) {
    const error = 'Data not present in POST request body';
    return next(error);
  }

  const postObject = req.body;
  postObject.senderId = userID;
  Post.create(postObject, (error, data) => {
    if (error) {
      if (error.name === 'ValidationError') {
        res.status(400);
        res.send('ValidationError');
      }
      // console.log(error)
      return next(error);
    }
    // console.log(data)
    res.json(data);
  });
});

router.route('/test').post((req, res, next) => {
  Test.create(req.body, (error, data) => {
    if (error) {
      if (error.name === 'ValidationError') {
        res.status(400);
        res.send('ValidationError');
      }
      // console.log(error)
      return next(error);
    }
    // console.log(data)
    res.json(data);
  });
});

router.route('/').get((req, res, next) => {
  // eslint-disable-next-line array-callback-return
  Post.find((error, data) => {
    if (error) {
      res.status(400).send(error);
      return next(error);
    }
    res.json(data);
  });
});

router.route('/update-post/:id').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  Post.findOneAndUpdate(
    { postId: req.params.id },
    {
      $set: req.body,
    },
    (error, data) => {
      if (error) {
        if (error.name === 'ValidationError') {
          res.status(400);
          res.send('ValidationError');
        }
        return next(error);
      }
      res.json(data);
      // console.log('Post updated successfully !')
    },
  );
});

router.route('/delete-post/:id').delete((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  Post.findOneAndDelete({ postId: req.params.id }, (error, data) => {
    if (error) {
      return next(error);
    }
    res.status(200).json({
      msg: data,
    });
  });
});

router.route('/users/create/').post((req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    const error = 'The loop object to create loop is not present';
    return next(error);
  }

  User.create(req.body, (error, data) => {
    if (error) {
      if (error.name === 'ValidationError') {
        res.status(400);
        res.send('ValidationError');
      }
      return next(error);
    }
    // [TODO] : Create a session
    console.log(data);
    res.json(data);
  });
});

router.route('/users/:id/');

router.route('/users/update').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  Post.findOneAndUpdate(
    { userId: req.params.id },
    {
      $set: req.body,
    },
    (error, data) => {
      if (error) {
        return next(error);
      }

      res.json(data);
      // console.log('User updated successfully !');
    },
  );
});

// Create a loop for a user
router.route('/users/create_loop').post((req, res, next) => {
  const { body } = req;
  // [TODO] : get user id from session
  const userID = '';

  if (Object.keys(body).length === 0) {
    res.status(400);
    const error = 'The loop object to create loop is not present';
    return next(error);
  }

  const loopObject = req.body.loop;
  Loop.create(loopObject, (error, data) => {
    if (error) {
      if (error.name === 'ValidationError') {
        res.status(400).send('ValidationError');
        // res.send("ValidationError")
      }
      console.log(error);
      return next(error);
    }
    // console.log(data)
    res.status(200).json(data);
  });
});

// Get the loops the user has created
router.route('/loops').post((req, res, next) => {
  // [TODO] get user id from session
  const userID = '123';
  Loop.find({ userId: userID }, (error, data) => {
    if (error) {
      res.status(400);
      return next(error);
    }

    console.log(data);
    res.json(data);
  });
});

// update loop of a user
router.route('/loops/:loop_id/update_loop').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  const { body } = req;
  if (Object.keys(body).length === 0) {
    const error = 'Data not present in POST request body';
    return next(error);
  }

  const loopID = req.params.loop_id;
  const { contacts } = req.body;
  if (Object.keys(contacts).length === 0) {
    const error = 'Contacts Details cannot be empty';
    res.status(400).statusMessage(error);
    return next(error);
  }

  // Update the members of the loop of a user
  Loop.update(
    { loopId: loopID },
    { $set: { receivingUsers: req.body.contacts } },
    (error, response) => {
      if (error) {
        const error = `Updation Error ${error}`;
        res.status(400).statusMessage(error);
        return next(error);
      }
      res.status(200).send(response);
    },
  );
});

// Return the members of a loop for a user
router.route('/loops/:loop_id/get_contacts').post((req, res, next) => {
  const { loop_id } = req.params;
  // [TODO] Get user id from session
  const userID = '';

  Loop.find({ loopId: loop_id }, { receivingUsers: 1 }, (error, response) => {
    if (error) {
      response.status(400);
      return next(error);
    }

    res.send(response);
  });
});

// Stores a message send from one user to another
router.route('/users/send_message').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  Message.create(req.body, (error, data) => {
    if (error) {
      console.log(error);
      return next(error);
    }
    console.log(data);
    res.json(data);
  });
});

// Get list of messages between two persons
router.route('/users/show_messages_persons').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';
  if (Object.keys(req.body).length === 0) {
    const error = 'Data not present in POST request body';
    return next(error);
  }

  const { pageNumber } = req.body;
  const { numberOfItems } = req.body;
  // eslint-disable-next-line max-len
  // Formula to paginate : skip(NUMBER_OF_ITEMS * (PAGE_NUMBER - 1)).limit(NUMBER_OF_ITEMS )
  // Initial Value (Example) :  PAGE_NUMBER=1, NUMBER_OF_ITEMS=10
  Message.find(
    { senderId: req.body.userID, receivingUserId: req.body.receivingUserId },
    null,
    { skip: numberOfItems * (pageNumber - 1), limit: numberOfItems },
    (error, data) => {
      if (error) {
        return next(error);
      }
      res.json(data);
    },
  );
});

router.route('/users/show_messages').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '123';
  if (Object.keys(req.body).length === 0) {
    const error = 'Data not present in POST request body';
    return next(error);
  }

  const { pageNumber } = req.body;
  const { numberOfItems } = req.body;
  // eslint-disable-next-line max-len
  // Formula to paginate : skip(NUMBER_OF_ITEMS * (PAGE_NUMBER - 1)).limit(NUMBER_OF_ITEMS )
  // Initial Value (Example) :  PAGE_NUMBER=1, NUMBER_OF_ITEMS=10
  Message.find(
    { senderId: req.body.userID },
    null,
    { skip: numberOfItems * (pageNumber - 1), limit: numberOfItems },
    (error, response) => {
      if (error) {
        res.status(400);
        return next(error);
      }

      res.json(response);
    },
  );
});

// Creates a post for the user
router.route('/users/create_post').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '';

  const { body } = req;
  if (Object.keys(body).length === 0) {
    res.status(400).send('Post data not present');
    return next('Post data not present');
  }

  Post.create(req.body.post, (error, data) => {
    if (error) {
      res.status(400).send('ValidationError');
      console.log(error);
      return next(error);
    }
    console.log(data);
    res.status(200).json(data);
  });
});

// /users/user_posts
router.route('/users/user_posts').post((req, res, next) => {
  // [TODO] Get user id from session
  const userID = '123';

  if (Object.keys(req.body).length === 0) {
    res.status(400).send('Post data not present');
    return next('Post data not present');
  }

  const { senderId } = req.body.post;
  const { pageNumber } = req.body.post;
  const { numberOfItems } = req.body.post;
  Post.find(
    { senderId },
    null,
    { skip: numberOfItems * (pageNumber - 1), limit: numberOfItems },
    (error, data) => {
      if (error) {
        console.log(`Error ${error}`);
        return next(error);
      }

      res.status(200).json(data);
    },
  );
});

// /posts/:post_id/delete
router.route('/posts/:post_id/delete').delete((req, res, next) => {
  Post.findOneAndDelete({ _id: req.params.post_id }, (error, data) => {
    if (error) {
      return next(error);
    }
    res.status(200).json({
      msg: data,
    });
  });
});

// Return the list of friends of a user
router.route('/users/add_friend').post((req, res, next) => {
  // [TODO] : get session from request body and validate
  const userID = '123';
  if (Object.keys(req.body).length === 0) {
    res.status(400).send('Post data not present');
    return next('Post data not present');
  }

  const { tagName } = req.body;

  UserConnection.update(
    { userId: userID },
    {
      $push: { friendIds: tagName },
    },
    {upsert: true},
    // eslint-disable-next-line consistent-return
    (error, response) => {
      if (error) {
        console.log(`Error ${error}`);
        return next(error);
      }
      res.status(200).json(response);
    },
    
  );
});

module.exports = router;
