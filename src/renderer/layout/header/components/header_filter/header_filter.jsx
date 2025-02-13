import React from 'react';
import { FilterSearchBar, FilterQueryList } from './components/index.js';
import styles from './header_filter.module.css';

export function HeaderFilter() {
  return (
    <div className={styles.panel}>
      <FilterSearchBar />

      <FilterQueryList />
    </div>
  );
}
