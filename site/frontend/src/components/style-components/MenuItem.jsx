import { DownSmall } from "../../icons/DownSmall.tsx";
import { UpSmall } from "../../icons/UpSmall.tsx";

function MenuItem({title, dropdown, selected, onClick}) {

  return (
    <div className={`navigation-item ${selected ? 'active' : ''}`} onClick={onClick}>
        <span>{title}</span>
        {dropdown && !selected ? (<span className="icon-span"><DownSmall /></span>) : null}
        {selected ? (<span className="icon-span"><UpSmall /></span>):null}
    </div>
  )
}

export default MenuItem
