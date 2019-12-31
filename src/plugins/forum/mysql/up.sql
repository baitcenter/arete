CREATE TABLE forum_topics(id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                           user_id BIGINT NOT NULL,
                                                                          title VARCHAR(255) NOT NULL,
                                                                                             body TEXT NOT NULL,
                                                                                                       media_type VARCHAR(36) NOT NULL,
                                                                                                                             version BIGINT NOT NULL DEFAULT 0,
                                                                                                                                                             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                                  updated_at DATETIME NOT NULL);


CREATE INDEX idx_forum_topics_title ON forum_topics(title);


CREATE TABLE forum_posts(id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                          user_id BIGINT NOT NULL,
                                                                         topic_id BIGINT NOT NULL,
                                                                                         post_id BIGINT, body TEXT NOT NULL,
                                                                                                                   media_type VARCHAR(36) NOT NULL,
                                                                                                                                         version BIGINT NOT NULL DEFAULT 0,
                                                                                                                                                                         created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                                                                                                                                                                              updated_at DATETIME NOT NULL);

