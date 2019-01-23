const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('knex')(require('../knexfile').development);

const secret = '[)super*totallySECRET(secret_goes-here@]';

const servErr = (res, activity) => {
  res.status(500).json({ message: `Something went wrong when ${activity}.` });
};

const generateToken = ({ id, name }) => {
  const payload = { id, name };
  const options = {
    expiresIn: '1h',
    jwtid: '1234',
    subject: String(id)
  };
  return jwt.sign(payload, secret, options);
};

const protect = (req, res, next) => {
  const token = req.headers.auth;
  if (token) {
    jwt.verify(token, secret, (err, _) => {
      if (err) { res.status(401).json({ message: 'You shall not pass!' }); }
      else next();
    });
  } else {
    res.status(403).json({ message: 'You shall not pass!' });
  }
};

router.use('/restricted', protect);

router.post('/register', (req, res) => {
  let { name, pass, department } = req.body;
  if (!name || !pass) {
    res.status(404).json({ message: 'You need to provide a unique username and password!' }).end();
  }
  pass = bcrypt.hashSync(pass, 10);
  db('users').insert({ name, pass })
    .then(([ id ]) => {
      if (department) {
        db('departments').where({ department }).first()
          .then(dept => {
            if (!dept || dept.length === 0) {
              db('departments').insert({ department })
                .then(([ deptId ]) => {
                  db('departments-for-users')
                    .insert({ department_id: deptId, user_id: id })
                    .catch(err => console.log(err));
                })
            } else {
              db('departments-for-users')
                .insert({ department_id: dept.id, user_id: id })
                .catch(err => console.log(err));
            }
          })
          .catch(err => console.error(err));
      }
      const token = generateToken({ id, name });
      res.status(201).json({ id, token });
    })
    .catch(servErr(res, 'registering'));
});

router.post('/login', (req, res) => {
  let { name, pass } = req.body;
  if (!name || !pass) {
    res.status(404).json({ message: 'You need to provide a username and password!' }).end();
  }
  db('users').where({ name }).first()
    .then(user => {
      if (!user || !bcrypt.compareSync(pass, user.pass)) {
        res.status(401).json({ message: 'You shall not pass!' }).end();
      }
      const token = generateToken(user);
      res.status(200).json({ token });
    })
    .catch(servErr(res, 'logging in'));
});

router.get('/restricted', (req, res) => {
  db('users').where({ id: req.session.userId }).first()
    .then(({ name }) => {
      res.status(200).json({ message: `You, ${name}, have access!` });
    })
    .catch(error => res.status(500).json({ error }));
});

router.get('/restricted/users', (_, res) => {
  db('users')
    .then(users => res.status(200).json(users))
    .catch(servErr(res, 'fetching the users'));
});

module.exports = router;
