import { SearchContext } from '../SearchProvider';

import Modal from './Modal';
import Number from './Number';
import Search from './Search';
import Dropdown from './Dropdown';
import Checkbox from './Checkbox';
import DateRange from './DateRange';

Modal.contextType = SearchContext;
Number.contextType = SearchContext;
Search.contextType = SearchContext;
Dropdown.contextType = SearchContext;
Checkbox.contextType = SearchContext;
DateRange.contextType = SearchContext;

export default {
  Modal,
  Number,
  Search,
  Dropdown,
  Checkbox,
  DateRange,
};
