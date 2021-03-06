import ShippingMethods from './ShippingMethods.jsx';
import React from 'react';
import { getRealItem } from '../js/data.js';
//购物网站
var ShoppingSite = React.createClass({
  getRealItem: getRealItem,
  getInitialState: function () {
    return {};
  },
  handleOtherBuyFeesInput: function (event) {
    var otherBuyFee = {};
    var otherBuyFee_id = event.target.name;
    otherBuyFee[otherBuyFee_id] = event.target;
    this.setState(otherBuyFee);
  },
  render: function () {
    var that = this;
    var item = this.getRealItem(this.props.item);
    var site = this.props.site;
    var japanShipmentPrice = site.japanShipmentPrice ? site.japanShipmentPrice(item.japanShipment) : 0;

    var japanPrice = //日本方面运费（人民币）
    site.itemprice(item.price) //价格
    + japanShipmentPrice; //日本国内运费
    for (var key in this.state) {//其他费用（来自输入）
      if (this.state.hasOwnProperty(key)) {
        japanPrice += site.otherBuyFees[key].input_calc(this.state[key],item);
      }
    }
    for (var i = 0; i < site.otherBuyFees.length; i++) {//其他费用（基于已付款费用）
      if(site.otherBuyFees[i].input_type=='hidden')
        japanPrice += site.otherBuyFees[i].input_calc(null,item);
    }
    if (site.finalPriceProc) {
      japanPrice = site.finalPriceProc(japanPrice);//对以日元结算的查看一下是否需要整体取整等操作
    }

    japanPrice = Math.round(japanPrice*100)/100;//对以日元结算的商品整体四舍五入
    return <li id={site.name}>
        <div className="site-name">
          <h3>商家</h3>
          {site.name}
        </div>
        <div className="japan-price">
          <h3>商品价格</h3>
          <div className="japan-price-wrapper">{item.price ? item.price : 0}日元
          { //日本国内运费
            japanShipmentPrice ?
            ' + '+ item.japanShipment+'日元 ' : null
          }
          { //其他可能的手续费等费用
            Array.isArray(site.otherBuyFees) ?
            site.otherBuyFees.map(function (otherBuyFee) {
              var insert =
              (()=>{switch (otherBuyFee.input_type) {
                case 'text':
                  return <span>
                    <input type='text'
                           name={otherBuyFee.id}
                           defaultValue={otherBuyFee.default_value}
                           onChange={that.handleOtherBuyFeesInput}
                           placeholder={otherBuyFee.name} />{otherBuyFee.is_rmb ? '元 ':'日元 '}
                  </span>;
                  break;
                case 'checkbox':
                  return <label>
                    <input type='checkbox'
                           defaultChecked={otherBuyFee.default_value}
                           name={otherBuyFee.id}
                           onChange={that.handleOtherBuyFeesInput} />{otherBuyFee.name}
                  </label>;
                  break;
                case 'hidden':
                  return null;
                default:
                  return '看到这个说明你药丸！';
                  break;
                }
              })();
              return <span key={otherBuyFee.id}>{otherBuyFee.input_type!='hidden' ? ' + ' : null}
              {
                insert
              }
              </span>
            }) : null
          }
          => <span className="price japan-price">{japanPrice} 元</span></div>
          <p>计算公式：{site.itemremark}</p>
        </div>
        <div className="site-method">
          <h3>运送方法</h3>
          <ShippingMethods methods={site.methods} item={item} japanPrice={japanPrice} siteid={site.id} />
        </div>
        <div className="site-according">
          <h3>根据</h3>
          { //根据
            site.accordings.map(function (according) {
              return <p key={according.key}><a href={according.value} target={according.newWindow ? '_blank': null}>{according.key}</a></p>
            })
          }
        </div>
      </li>
  }
});

export default ShoppingSite;