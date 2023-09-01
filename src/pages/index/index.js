import {PureComponent} from 'react';
import styles from './index.less';


export default class IndexBackUP extends PureComponent {
  render() {
    return (
      <div className={styles.Index}>
        <img src={require("@/assets/logo.png")} alt=""/>
      </div>
    );
  }
}
