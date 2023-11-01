import './CSS/sidebar.css';
import * as routePaths from '../../routePaths';

const GenshinSideBar = ({ activeTab }) => {
  return (
    <div className="sidebar">
      <p className="sidebar-small-title">Reverse: 1999</p>
      <h2 className="navigation-title">Navigation</h2>
      <ul>
        <li
          className={`navigation-items ${activeTab === 'Home' ? 'active' : ''}`}
        >
          <a href={routePaths.REVERSE_HOME_PATH}>Home</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'Warp Tracker' ? 'active' : ''
          }`}
        >
          <a href={routePaths.REVERSE_WISH_TRACKER_PATH}>Summon Tracker</a>
        </li>
        <li
          className={`navigation-items ${
            activeTab === 'Resonate Optimizer' ? 'active' : ''
          }`}
        >
          <a href={routePaths.REGISTER_PATH_RESONATE_OPTIMIZER}>Resonate Optimizer</a>
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
