// Arbitrary link that could contain any kind of URL.

import React from 'react';
import { Link } from 'react-router-dom';
import ExternalLink from './ExternalLink';
import MailLink from './MailLink';
import TelLink from './TelLink';

const TEL_LINK_REG = /^tel:/;
const MAIL_LINK_REG = /^mailto:/;
const EXTERNAL_LINK_REG = /^https?:/;

export default class ContentLink extends React.Component {

  render() {
    const { href, ...props } = this.props;
    if (EXTERNAL_LINK_REG.test(href)) {
      return <ExternalLink href={href} {...props} />;
    } else if (MAIL_LINK_REG.test(href)) {
      return <MailLink mail={href.replace(MAIL_LINK_REG, '')} {...props} />;
    } else if (TEL_LINK_REG.test(href)) {
      return <TelLink tel={href.replace(TEL_LINK_REG, '')} {...props} />;
    } else {
      return <Link to={href} {...props} />;
    }
  }

}
