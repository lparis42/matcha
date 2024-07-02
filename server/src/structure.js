const structure = {
  database: {
    users_session: {
      columns: [
        `sid VARCHAR NOT NULL PRIMARY KEY`,
        `sess JSON NOT NULL`,
        `account INT NOT NULL DEFAULT 0`,
        `socket_ids VARCHAR[] NOT NULL DEFAULT ARRAY[]::VARCHAR[]`,
        `expire TIMESTAMP(6) NOT NULL`
      ],
    },
    users_private: {
      columns: [
        `id SERIAL PRIMARY KEY`,

        `email VARCHAR(50) UNIQUE CHECK (char_length(email) BETWEEN 6 AND 50 AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$') DEFAULT NULL`,
        `password VARCHAR(60) DEFAULT NULL`,
        `password_reset_key VARCHAR(20) DEFAULT NULL`,
        `viewers INT[] DEFAULT ARRAY[]::INT[]`,
        `likers INT[] DEFAULT ARRAY[]::INT[]`,
        `view_history INT[] DEFAULT ARRAY[]::INT[]`,

        `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      ],
      column_names: [
        `email`, `password`, `viewers`, `likers`, `view_history`
      ],
    },
    users_preview: {
      columns: [
        `id SERIAL PRIMARY KEY`,

        `activation_key VARCHAR(20)`,
        `email VARCHAR(50) UNIQUE CHECK (char_length(email) BETWEEN 6 AND 50 AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`,
        `password VARCHAR(60)`,
        `username VARCHAR(20) UNIQUE CHECK (char_length(username) BETWEEN 6 AND 20 AND username ~ '^[A-Za-z0-9]+$')`,
        `first_name VARCHAR(35)`,
        `last_name VARCHAR(35)`,

        `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      ],
      column_names: [
        `activation_key`, `email`, `password`, `username`, `first_name`, `last_name`
      ],
    },
    users_public: {
      columns: [
        `id SERIAL PRIMARY KEY`,

        `username VARCHAR(20) UNIQUE CHECK (char_length(username) BETWEEN 6 AND 20 AND username ~ '^[A-Za-z0-9]+$')`,
        `first_name VARCHAR(35) CHECK (char_length(first_name) BETWEEN 2 AND 35 AND first_name ~ '^[A-Za-z]+$')`,
        `last_name VARCHAR(35) CHECK (char_length(last_name) BETWEEN 2 AND 35 AND last_name ~ '^[A-Za-z]+$')`,
        `date_of_birth DATE CHECK (date_of_birth BETWEEN '1900-01-01' AND '2024-12-31')`,
        `gender VARCHAR(35) CHECK (gender IN ('Male', 'Female'))`,
        `sexual_orientation VARCHAR(35) CHECK (sexual_orientation IN ('Heterosexual', 'Bisexual', 'Homosexual', 'Other'))`,
        `biography VARCHAR(255)`,
        `common_tags INT[] DEFAULT ARRAY[]::INT[]`,
        `pictures VARCHAR(255)[5] DEFAULT ARRAY[]::VARCHAR(255)[]`,
        `fame_rating INT DEFAULT 0`,
        `geolocation_proxy BOOLEAN DEFAULT FALSE`,
        `geolocation VARCHAR[2]` /* [latitude, longitude] */,
        `location VARCHAR(255) DEFAULT 'Unknown'`,
        `online BOOLEAN DEFAULT FALSE`,
        `last_connection TIMESTAMP`,
        `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      ],
      column_names: [
        `username`, `first_name`, `last_name`, `date_of_birth`,
        `gender`, `sexual_orientation`, `biography`, `common_tags`,
        `pictures`, `fame_rating`, `geolocation`, `location`, `online`,
        `last_connection`
      ],
      common_tags: [
        'Technology', 'Health', 'Business', 'Entertainment', 
        'Travel', 'Education', 'Arts and Culture', 'Lifestyle', 
        'Science', 'Politics', 'Environment', 'Gastronomy', 
        'Sports', 'Automobile', 'Fashion', 'Economy', 
        'History', 'Philosophy', 'Religion', 'Law'
      ],
      genders: [
        'Male', 'Female'
      ],
      sexual_orientations: [
        'Heterosexual', 'Bisexual', 'Homosexual', 'Other'
      ],

    },
    users_match: {
      columns: [
        `id SERIAL PRIMARY KEY`,

        `online BOOLEAN DEFAULT FALSE`,
        `accounts INT[2] UNIQUE DEFAULT ARRAY[]::INT[2]`,
        `messages VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[]`,

        `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      ],
      column_names: [
        `online`, `accounts`, `messages`
      ],
    },
    users_report: {
      columns: [
        `id SERIAL PRIMARY KEY`,

        `reporter INT`,
        `reported INT`,

        `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      ],
      column_names: [
        `reporter`, `reported`
      ],
    },
  },
};

module.exports = structure;
