import { useNavigate } from 'react-router-dom';
import { useT } from '../../../shared/i18n/useT';
export function SearchButton(){
  const t = useT();const navigate=useNavigate();return <button className="nav-button" onClick={()=>navigate('/search')}>{t('search.title')}</button>}
