CREATE DATABASE IF NOT EXISTS dominion_auth
    CHARACTER SET = utf8;

USE dominion_auth;

CREATE TABLE `accounts` (
    `id` INT(10) unsigned NOT NULL AUTO_INCREMENT,
    `phone_number` BIGINT UNSIGNED,
    `email` VARCHAR(100),
    `password_hash` VARCHAR(255),
    `password_salt` VARCHAR(255),
    PRIMARY KEY (`id`),
    UNIQUE KEY `phone_number` (`phone_number`),
    UNIQUE KEY `email` (`email`)
);

CREATE TABLE `sessions` (
    `id` varchar(250) NOT NULL,
    `refresh_token_hash` varchar(256) NOT NULL,
    `refresh_token_salt` varchar(256) NOT NULL,
    `state` enum('ACTIVE','EXPIRED','REVOKED') DEFAULT 'ACTIVE',
    `accounts_id` int(10) unsigned DEFAULT NULL,
    `issueTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ttl` int(10) unsigned NOT NULL,
    `tokenExpirationTime` timestamp NOT NULL DEFAULT '1970-01-01 08:00:00',
    `revokeTime` timestamp NULL DEFAULT NULL,
    `footprint` mediumtext,
    `userAgent` varchar(250) DEFAULT NULL,
    `ip` varchar(15) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `key_state_expire` (`state`,`tokenExpirationTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET GLOBAL event_scheduler = ON;
CREATE EVENT e_session_state
    ON SCHEDULE
      EVERY 15 minute
    DO
      UPDATE sessions SET state = "EXPIRED" WHERE state = "ACTIVE" AND tokenExpirationTime < NOW();


ALTER TABLE sessions
ADD CONSTRAINT fk_sessions_accounts
FOREIGN KEY (accounts_id)
REFERENCES accounts(id);
