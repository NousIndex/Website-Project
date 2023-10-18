import './CSS/sidebar.css';
import * as routePaths from '../../routePaths';

const GenshinSideBar = ({ activeTab }) => {
  return (
    <div className="sidebar">
      <h2 className="navigation-title">Navigation</h2>
      <ul>
        <li
          className={`navigation-items ${activeTab === 'Home' ? 'active' : ''}`}
        >
          <a href={routePaths.STARRAIL_HOME_PATH}>Home</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'Warp Tracker' ? 'active' : ''
          }`}
        >
          <a href={routePaths.STARRAIL_WISH_TRACKER_PATH}>Warp Tracker</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'Farmable' ? 'active' : ''
          }`}
        >
          <a /*href={routePaths.STARRAIL_FARM_PATH}*/>Farmable (WIP)</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'TimeLine' ? 'active' : ''
          }`}
        >
          <a /*href={routePaths.STARRAIL_TIMELINE_PATH}*/>TimeLine (WIP)</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'Database' ? 'active' : ''
          }`}
        >
          <a /*href={routePaths.STARRAIL_DATABASE_PATH}*/>Database (WIP)</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'Achievements' ? 'active' : ''
          }`}
        >
          <a /*href={routePaths.STARRAIL_ACHIEVEMENTS_PATH}*/>
            Achievements (WIP)
          </a>
        </li>
      </ul>
    </div>
  );
};

export default GenshinSideBar;
