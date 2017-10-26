//@flow
import React, { Component } from 'react';

class Section extends Component<*> {
  props: {
    title: string,
    className: string,
    titleRight: *,
    children: *
  };
  static defaultProps = { className: '' };
  render() {
    const { title, titleRight, children, className } = this.props;
    return (
      <div className={`bloc ${className}`}>
        <header>
          <h3>{title}</h3>
          <h3 className="title-right">{titleRight}</h3>
        </header>
        <div className="bloc-content">{children}</div>
      </div>
    );
  }
}

export default Section;
