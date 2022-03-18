CREATE DATABASE metax;

USE metax;
CREATE TABLE `daily_statistic` (
  `id` int NOT NULL AUTO_INCREMENT,
  `active` int DEFAULT NULL,
  `signedup` int DEFAULT NULL,
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `dayofweek` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;


CREATE TABLE `user_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `isActive` tinyint NOT NULL DEFAULT '0',
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `email` varchar(150) NOT NULL,
  `registertype` int NOT NULL,
  `usercode` varchar(30) NOT NULL,
  `password` varchar(50) NOT NULL,
  `activecode` varchar(100) NOT NULL,
  `fullname` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `signincounter` int DEFAULT '0',
  `lastedsignin` int DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `usercode` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5a403455fabe3df00fef56b727` (`usercode`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb3;
