const database = {
  users: {
    columns: [
      `id SERIAL PRIMARY KEY`,
      `username VARCHAR(20) UNIQUE CHECK (char_length(username) BETWEEN 6 AND 20 AND username ~ '^[A-Za-z0-9]+$')`,
      `password VARCHAR(60)`,
      `email VARCHAR(50) UNIQUE CHECK (char_length(email) BETWEEN 6 AND 50 AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`,
      `last_name VARCHAR(35)`,
      `first_name VARCHAR(35)`,
      `date_of_birth DATE CHECK (date_of_birth BETWEEN '1900-01-01' AND '2021-12-31')`,
      `gender VARCHAR(35) CHECK (gender IN ('Male', 'Female', 'Other'))`,
      `sexual_orientation VARCHAR(35) CHECK (sexual_orientation IN ('Heterosexual', 'Bisexual', 'Homosexual', 'Other'))`,
      `biography VARCHAR(255)`,
      `interests VARCHAR(50)[10]`,
      `pictures VARCHAR(255)[5] DEFAULT ARRAY['defaut.jpg']::VARCHAR(255)[]`,
      `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    ],
  },
};

const online = {
  users: {},
};

module.exports = { database, online };
