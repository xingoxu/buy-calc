import { app, realTimeStorage } from './js/data.js';
import './less/base.less';
import ShoppingSite from './react-template/ShoppingSite.jsx';
import ShoppingCart from './react-template/ShoppingCart.jsx';

import React from 'react';
import ReactDOM from 'react-dom';
var MainApp = React.createClass({
  getInitialState: function () {
    return {
      price: 0,
      weight: '',
      japanShipment: '',
      itemKind: 99,
      itemInputOpen: 'open',
      itemKindOpen: 'open',
      exchange_ajaxing: true,
      exchange_editing: false,
    }
  },
  componentDidMount: function () {
    //用ajax 载入汇率
    //因为是jsonp，我们需要暴露一下自己
    this.props.app.react_callback = function () {
      if((!this.isMounted()) || this.state.exchange_editing)
        return;
      this.setState({
        exchange_ajaxing: false,
      });
    }.bind(this);
    this.reload_live_exchange();
  },
  reload_live_exchange: function () {
    this.setState({
      exchange_ajaxing: true
    });
    this.exchange_request = this.props.app.ajax_load_exchange();
  },
  calc: function (event) {
    var item = {};
    switch (event.target) {
      case this.refs.itempriceInput:
        item.price = Number.parseInt(event.target.value) ? Number.parseInt(event.target.value) : 0;
        break;
      case this.refs.japanShipmentInput:
        item.japanShipment = Number.parseInt(event.target.value) ? Number.parseInt(event.target.value) : 0;
        break;
      case this.refs.itemweightInput:
        item.weight = Number.parseInt(event.target.value) ? Number.parseInt(event.target.value) : 0;
        break;
      default://radio
        item.itemKind = event.target.value;
        break;
    }
    this.setState(item);
  },
  getItem: function () {
    return {
      price: this.state.price,
      weight: this.state.weight,
      japanShipment: this.state.japanShipment,
      itemKind: this.state.itemKind,
      shipid: this.state.shipid
    }
  },
  setShip: function (event) {
    if(event.target.name!='ship' || event.target.checked!=true)
      return;
    this.setState({
      shipid: event.target.value
    });
  },
  addToCart: function (event) {
    var item = this.getItem();
    var shipid = item.shipid;
    var cart = this.props.app.cart;

    this.props.app.cart.push({
      japanPrice: realTimeStorage[shipid].japanPrice,
      weight: item.weight,
      itemKind: item.itemKind,
      shipid: shipid,
    });
    //清空输入
    this.setState({
      price: 0,
      weight: '',
      japanShipment: ''
    });

    // this.refs.shoppingCart.forceUpdate();//设置了state就不需要再forceUpdate了

    //滚到cart部分
    setTimeout(() => {
      document.getElementsByTagName('body')[0].scrollTop = document.getElementById('shopping-cart').offsetTop;      
    }, 100);
  },
  switchItemInput: function (event) {
    var isOpen = 'open';
    if(this.state.itemInputOpen){
      isOpen = false;
    }
    this.setState({
      itemInputOpen: isOpen
    });
  },
  switchItemKind: function (event) {
    var isOpen = 'open';
    if(this.state.itemKindOpen){
      isOpen = false;
    }
    this.setState({
      itemKindOpen: isOpen
    });
  },
  switchSideSites: function (event) {
    var isOpen = 'open';
    if(this.state.sideSiteOpen){
      isOpen = false;
    }
    this.setState({
      sideSiteOpen: isOpen
    });
  },
  toTop: function (event) {
    window.scrollTo(null,0);
  },
  switchMobileSideBar: function (event) {
    var isOpen = 'open';
    if(this.state.mobileSideBar){
      isOpen = false;
    }
    this.setState({
      mobileSideBar: isOpen
    });
  },
  edit_exchange: function (event) {
    if(this.exchange_request)
      this.exchange_request.abort();
    this.setState({
      exchange_editing: true,
    });
  },
  change_exchange: function (event) {
    this.props.app.exchange = Number.parseFloat(this.refs.exchangeInput.value) ? Number.parseFloat(this.refs.exchangeInput.value) : this.props.app.exchange ;
    this.setState({
      exchange_editing: false,
    });
  },
  render: function () {
    var item = this.getItem();
    return <div className="app-wrapper">
      <div className="top">
        <div className="app-title">
          <img src={ require("assets/title-pic.jpg") }></img>
          <h1>日系剁手网站<br />综合价格对比工具</h1>
        </div>
        <div className="center-exchange-wrapper pull-right">
          <div className={"exchange-wrapper " + (this.state.exchange_editing ? 'editing' : '')}>
            <div className="exchange">
              <p>当前汇率：{this.props.app.exchange ? this.props.app.exchange : '需要手动更新汇率'}</p>
              <button className="edit" onClick={this.edit_exchange} title="手动修改汇率"></button>
              <button className={'reload '+(this.state.exchange_ajaxing ? 'loading' : '')} onClick={this.reload_live_exchange} disabled={this.state.exchange_ajaxing || this.state.exchange_editing} title="请求实时汇率"></button>
            </div>
            <div className="exchange editor">
              <p>当前汇率：<input type="text" ref="exchangeInput" /></p>
              <button onClick={this.change_exchange} title="确认"></button>
            </div>
          </div>
        </div>

      </div>
      <form className={"app-right-inputs "+this.state.mobileSideBar} action="javascript:;" onChange={this.calc}>
        <section className={"item-inputs "+this.state.itemInputOpen}>
          <div className="switch" onClick={this.switchItemInput}></div>
          <h3>输入物品基本信息</h3>
          <div className="inputs">
            <label className="item-input-label">物品价格（不含税）：</label>
            <div>
              <input type="text" ref="itempriceInput" value={item.price}/>
              <label className="item-input-unit">日元</label>
            </div>
            <label className="item-input-label">日本国内运费（税入）：</label>
            <div>
              <input type="text" ref="japanShipmentInput" value={item.japanShipment}/>
              <label className="item-input-unit">日元</label>
            </div>
            <label className="item-input-label">物品重量：</label>
            <div>
              <input type="text" ref="itemweightInput" value={item.weight}/>
              <label className="item-input-unit small-unit">g</label>
            </div>
          </div>
        </section>
        <section className={"itemKind-inputs "+this.state.itemKindOpen}>
          <div className="switch" onClick={this.switchItemKind}></div>
          <h3>选择物品种类</h3>
          <div className="inputs">
            <ul>
            {//选择物品种类
              this.props.app.itemKinds.map(function (itemKind) {
                return <li key={itemKind.id}>
                  <label>
                    <input type="radio" name="itemKind" value={itemKind.id}  defaultChecked={item.itemKind==itemKind.id}/>{itemKind.name}
                  </label>
                </li>
              })
            }
            </ul>
          </div>
        </section>
        <section className="select-ship">
          <h3><span className="mobile-none">←</span> 选择商家的运送方法</h3>
        </section>
        <section className="add-cart">
          <button onClick={this.addToCart} disabled={ !item.shipid || !item.weight }>加入购物车</button>
        </section>
        <section className={"side-sites "+this.state.sideSiteOpen}>
          <div className="switch" onClick={this.switchSideSites}></div>
          <h3>快速跳转商家</h3>
          <div className="inputs">
            {
              this.props.app.shoppingSite.map(function (site,index) {
                return <a href={'#' + site.name} key={index}>{site.name}</a>
              })
            }
          </div>
        </section>
      </form>
      <button id="menu" onClick={this.switchMobileSideBar}></button>
      <button id="totop" onClick={this.toTop}></button>
      <div className="table-wrapper">
        <form action="javascript:;" onChange={this.setShip}>
          <ul>
          {
            this.props.app.shoppingSite.map(function (site) {
              return <ShoppingSite key={site.id}
                                   site={site}
                                   item={item} />
            })
          }
          </ul>
        </form>
      </div>

      <ShoppingCart ref='shoppingCart' cart={this.props.app.cart} sites={this.props.app.shoppingSite} />
      <ol className="remark-wrapper">
        备注：
        {
          this.props.app.remarks.map(function (remark) {
            return <li key={remark.id} id={'according-'+remark.id}>{remark.words} {remark.link ? <a href={remark.link}>详情链接</a> : '' }</li>
          })
        }
      </ol>
      <footer>
        <span>© {(new Date()).getFullYear()}</span>
        <span> xingo | </span>
        <a href="https://github.com/xingoxu/buy-calc">GitHub Repo</a>
        <span> | </span>
        <a href="https://github.com/xingoxu/buy-calc/blob/master/changelog.md">更新日志</a>
      </footer>
    </div>
  }
})
ReactDOM.render(
  <MainApp app={app} />,
  document.getElementById('react-main')
);
