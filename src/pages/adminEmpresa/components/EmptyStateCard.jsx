import React from "react";
import { FiClock } from "react-icons/fi";
import styles from "./EmptyStateCard.module.scss";

const EmptyStateCard = ({ title, description }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState__icon}>
        <FiClock size={20} />
      </div>

      <div className={styles.emptyState__content}>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default EmptyStateCard;