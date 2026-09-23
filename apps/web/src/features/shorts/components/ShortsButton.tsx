import { Link } from 'react-router-dom';
import { NovaIcon } from '../../../components/ui/NovaIcon';
import { useT } from '../../../shared/i18n/useT';
export function ShortsButton(){
  const t = useT();return <Link className="nav-button" to="/shorts"><NovaIcon name="shorts"/><span>{t('nav.shorts')}</span></Link>}
