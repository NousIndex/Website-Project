import './CSS/sidebar.css';
import * as routePaths from '../../routePaths'; 

const GenshinSideBar = () => {
    return (
      <div className="sidebar">
        <h2 className='navigation-title'>Navigation</h2>
        <ul>
          <li className='navigation-items'><a href={routePaths.GENSHIN_HOME_PATH}>Home</a></li>
          <li className='navigation-items'><a href={routePaths.GENSHIN_WISH_TRACKER_PATH}>Wish Tacker</a></li>
          <li className='navigation-items'><a href={routePaths.GENSHIN_FARM_PATH}>Farmable</a></li>
          <li className='navigation-items'><a href={routePaths.GENSHIN_TIMELINE_PATH}>TimeLine</a></li>
          <li className='navigation-items'><a href={routePaths.GENSHIN_DATABASE_PATH}>Database</a></li>
          <li className='navigation-items'><a href={routePaths.GENSHIN_ACHIEVEMENTS_PATH}>Achievements</a></li>
        </ul>
      </div>
    );
};

export default GenshinSideBar;