import React, { createRef, Component, Fragment } from "react";

import { observer, inject } from "mobx-react";
import { types, getParentOfType, getRoot, getParent } from "mobx-state-tree";

import Konva from "konva";
import { Shape, Label, Stage, Layer, Rect, Text, Transformer, Line, Circle } from "react-konva";

import { guidGenerator, restoreNewsnapshot } from "../../core/Helpers";

import { Dropdown, Input } from "semantic-ui-react";

import Registry from "../../core/Registry";

import { LabelsModel } from "../control/Labels";
import { RatingModel } from "../control/Rating";
import { ImageModel } from "../object/Image";
import RegionsMixin from "../mixins/Regions";
import NormalizationMixin from "../mixins/Normalization";

const PolygonPoint = types
  .model({
    init_x: types.optional(types.number, 0),
    init_y: types.optional(types.number, 0),

    x: types.number,
    y: types.number,

    style: types.string,
    size: types.string,
    // isMouseOverStartPoint: types.optional(types.boolean, false),
  })
  .views(self => ({
    get parent() {
      return getParent(self, 2);
    },
  }))
  .actions(self => ({
    afterCreate() {
      self.init_x = self.x;
      self.init_y = self.y;
    },

    movePoint(x, y) {
      self.x = self.init_x + x;
      self.y = self.init_y + y;
    },

    _movePoint(x, y) {
      self.init_x = x;
      self.init_y = y;

      self.x = x;
      self.y = y;
    },

    handleMouseOverStartPoint(ev) {
      const stage = self.parent.parent._stageRef;
      stage.container().style.cursor = "crosshair";

      if (self.parent.closed || self.parent.points.length < 3) return;

      const t = ev.target;

      t.setX(t.x() - t.width() / 2);
      t.setY(t.y() - t.height() / 2);

      const scaleMap = {
        small: 3,
        medium: 2,
        large: 2,
      };

      const scale = scaleMap[self.size];

      t.scale({ x: scale, y: scale });

      self.parent.setMouseOverStartPoint(true);
    },

    handleMouseOutStartPoint(ev) {
      const t = ev.target;

      const stage = self.parent.parent._stageRef;
      stage.container().style.cursor = "default";

      t.setX(t.x() + t.width() / 2);
      t.setY(t.y() + t.height() / 2);
      t.scale({ x: 1, y: 1 });

      self.parent.setMouseOverStartPoint(false);
    },
  }));

const PolygonPointView = observer(({ item, index }) => {
  const sizes = {
    small: 4,
    medium: 8,
    large: 12,
  };

  const stroke = {
    small: 1,
    medium: 2,
    large: 3,
  };

  const w = sizes[item.size];

  const startPointAttr =
    index === 0
      ? {
          hitStrokeWidth: 12,
          onMouseOver: item.handleMouseOverStartPoint,
          onMouseOut: item.handleMouseOutStartPoint,
        }
      : null;

  const isOver = item.parent.mouseOverStartPoint;

  const dragOpts = {
    onDragStart: e => {
      //handleDragStartPoint
    },

    onDragMove: e => {
      item._movePoint(e.target.attrs.x, e.target.attrs.y);

      /* const points = this.state.points; */
      /* const index = e.target.index - 1; */
      /* console.log(event.target); */
      /* const pos = [event.target.attrs.x, event.target.attrs.y]; */
      /* console.log("move", event); */
      /* console.log(pos); */
      /* this.setState({ */
      /*     points: [...points.slice(0, index), pos, ...points.slice(index + 1)] */
      /* }); */
    },

    onDragEnd: e => {
      // handleDragEndPoint
    },

    onMouseOver: e => {
      const stage = item.parent.parent._stageRef;
      stage.container().style.cursor = "crosshair";
    },

    onMouseOut: e => {
      const stage = item.parent.parent._stageRef;
      stage.container().style.cursor = "default";
    },
  };

  if (item.style == "circle") {
    return (
      <Circle
        key={index}
        x={item.x - w / 2}
        y={item.y - w / 2}
        radius={w}
        fill="white"
        stroke="black"
        strokeWidth={stroke[item.size]}
        {...dragOpts}
        {...startPointAttr}
        draggable
      />
    );
  } else {
    return (
      <Rect
        key={index}
        x={item.x - w / 2}
        y={item.y - w / 2}
        width={w}
        height={w}
        fill="white"
        stroke="black"
        strokeWidth={stroke[item.size]}
        dragOnTop={false}
        {...dragOpts}
        {...startPointAttr}
        draggable
      />
    );
  }
  // <Rect width={w}
  //       height={w}
  //       x={item.x - w/2}
  //       y={item.y - w/2}
  //       fill="black"

  //       onClick={(ev) => {
  //           item.parent.closePoly();

  //           ev.cancelBubble = true;
  //           ev.evt.stopPropagation();
  //       }}

  //       dragBoundFunc={function(pos) {
  //           let { x, y } = pos;
  //           if (x < 0) x = 0;
  //           if (y < 0) y = 0;

  //           // /* const r = wwidth - this.getAttr('width'); */
  //           // /* const b = wheight - this.getAttr('height'); */

  //           item._movePoint(x, y);
  //           // if (x > r) x = r;
  //           // if (y > b) y = b;
  //           // item.redrawParent();

  //         return {
  //             x: x,
  //             y: y,
  //         };

  //       }}

  //  draggable
  // />
});

export { PolygonPoint, PolygonPointView };
