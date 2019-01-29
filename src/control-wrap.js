import {define, WeElement} from 'omi'
import cs from 'classnames'
import { mmss, Slider } from './util'

define('control-wrap', class extends WeElement {
  static observe = true
  render (props) {
    var { props, data } = this

    var { showThumbnail } = this.data

    var cls = cs(
      'control_wrap',
      props.showWrap && 'control_wrap--visible',
      !props.showWrap && 'control_wrap--hidden'
    )

    // console.log('enableSendDanmaku:%s,enableSwitchDanmaku:%s', props.enableSendDanmaku, props.enableSwitchDanmaku)
    return (
      <div>
        <div className={cs('loading_mask_wrap', !props.showWrap && 'loading_mask_wrap--active')}>
          <div><img src={require('./assets/loading.gif')} alt=""/></div>
        </div>
        <section className={cls}
        onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseMove={this.handleMouseMove} onMouseLeave={this.handleMouseLeave}>
          {
            <div ref={el => this.$wrap = el}
              className={cs('wrap', this.data.showUi && 'wrap--visible', !this.data.showUi && 'wrap--hidden')
            }>
              <div className="mask"></div>
              <div class="ui" >
                <div class="control_bottom">
                    <div class="control_bottom_t">
                      <div class="control_bottom_t_progress">
                        <div class="control_bottom_t_progress_slider" ref={el => this.$control_bottom_t_progress_slider = el}
                          onMouseMove={this.handleSliderMouseMove}
                        onMouseOver={this.handleSliderMouseOver}
                        onMouseOut={this.handleSliderMouseOut}
                        onClick={this.handleChangeCurrent}>
                          <div class="control_bottom_t_progress_slider_track" style={{height: showThumbnail ? '3.5px' : '2px'}}>
                            <div style={{transform: `scaleX(${data.buffPercent})`}} class="control_bottom_t_progress_slider_buff"></div>
                            <div style={{transform: `scaleX(${data.sliderDotProgress})`}} class="control_bottom_t_progress_slider_normal"></div>
                          </div>
                          <div style={{ left: data.sliderDotProgress * 100 + '%', transform: `translate3d(-50%,-50%,0) scale(${showThumbnail ? 1.5 : 1})` }} ref={el => this.$control_bottom_t_progress_slider_dot = el} class="control_bottom_t_progress_slider_dot" ></div>

                          {
                            props.thumbnail && props.thumbnailtile &&
                            <div ref={el => this.$control_bottom_t_progress_slider_thumbnail = el} style={{
                              left: this.data.thumbnailLeft,
                              backgroundPositionX: this.data.thumbnailBackgroundPositionX,
                              backgroundImage: `url(${props.thumbnail})`,
                              display: showThumbnail ? 'block' : 'none'
                            }} class="control_bottom_t_progress_slider_thumbnail" >
                              <div ref={el => this.$control_bottom_t_progress_slider_thumbnail_time = el} class="control_bottom_t_progress_slider_thumbnail_time">{`${props.thumbnailTime.mm}:${props.thumbnailTime.ss}`}</div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                    <div class="control_bottom_b" style={{display: this.data.showCommentControl ? 'none' : 'block'}}>
                      <div class="control_bottom_b_inner">
                        <div class="control_bottom_b_left">
                          <div onClick={this.handlePlay} class="control_play control_play_start control_play_pause control_btn">
                            {
                              !props.play
                              ? <div class="iconfont_start control_play_on">
                                <div class="svgicon">
                                  <svg viewBox="0 0 22 22" >
                                    <path d="M17.982 9.275L8.06 3.27A2.013 2.013 0 0 0 5 4.994v12.011a2.017 2.017 0 0 0 3.06 1.725l9.922-6.005a2.017 2.017 0 0 0 0-3.45z"></path>
                                  </svg>
                                </div>
                              </div>
                              : <div class="iconfont_pause control_play_off">
                                <div class="svgicon">
                                  <svg viewBox="0 0 22 22"><path d="M7 3a2 2 0 0 0-2 2v12a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2zM15 3a2 2 0 0 0-2 2v12a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2z"></path></svg>
                                </div>
                              </div>
                            }
                          </div>
                          <div class="control_time ">
                            <div class="control_time_textarea" style="color:white;">
                              <span class="control_time_textarea_current">{`${data.currentTime.mm}:${data.currentTime.ss}`}</span>
                              <span class="control_time_textarea_divider">/</span>
                              <span class="control_time_textarea_total">{`${data.totalTime.mm}:${data.totalTime.ss}`}</span>
                            </div>
                          </div>
                        </div>
                        <div class="control_bottom_b_center">
                          <div style={{
                            visibility: props.enableSwitchDanmaku ? 'visible' : 'hidden',
                            opacity: props.enableSwitchDanmaku ? '1' : '0'
                            }} class={cs('control_danmaku_switch', this.data.offDanmaku && 'control_danmaku_switch--off')} ref={el => this.$control_danmaku_switch = el} onClick={this.handleDanmakuSwitch}>
                            <div class="control_danmaku_switch_body">
                              <div class="control_danmaku_switch_dot">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.311 3.759l-.153 1.438h2.186c0 1.832-.066 3.056-.175 3.674-.131.618-.688.959-1.683 1.023-.284 0-.568-.021-.874-.043L.317 8.818c.284.032.59.053.896.053.546 0 .852-.17.929-.511.077-.341.12-1.076.12-2.204H0l.306-3.344h1.847V1.427H.098V.479h3.18v3.28H1.311zM4 1.747h1.311A8.095 8.095 0 0 0 4.492.426L5.53.085c.306.426.579.873.809 1.363l-.689.299h1.508c.306-.544.569-1.129.809-1.747l1.082.373c-.219.511-.47.969-.743 1.374h1.268V6.23H7.322v.82H10v1.044H7.322V10H6.208V8.094H3.607V7.05h2.601v-.82H4V1.747zm4.568 3.557v-.831H7.322v.831h1.246zm-2.36 0v-.831H5.016v.831h1.192zM5.016 3.557h1.191v-.873H5.016v.873zm2.306-.873v.873h1.246v-.873H7.322z"></path></svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="control_bottom_b_right">

                          <div class="control_volumn control_btn">
                            {
                              !this.data.offVolumn
                              ? <div onClick={this.handleVolumn} class="iconfont_volumn_off control_volumn_on">
                                <div class="svgicon">
                                  <svg viewBox="0 0 22 22">
                                    <path d="M10.188 4.65L6 8H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1l4.188 3.35a.5.5 0 0 0 .812-.39V5.04a.498.498 0 0 0-.812-.39zM14.446 3.778a1 1 0 0 0-.862 1.804 6.002 6.002 0 0 1-.007 10.838 1 1 0 0 0 .86 1.806A8.001 8.001 0 0 0 19 11a8.001 8.001 0 0 0-4.554-7.222z"></path>
                                    <path d="M15 11a3.998 3.998 0 0 0-2-3.465v6.93A3.998 3.998 0 0 0 15 11z"></path>
                                  </svg>
                                </div>
                              </div>
                              : <div onClick={this.handleVolumn} class="iconfont_volumn_on control_volumn_off">
                                <div class="svgicon">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M15 11a3.998 3.998 0 0 0-2-3.465v2.636l1.865 1.865A4.02 4.02 0 0 0 15 11z"></path><path d="M13.583 5.583A5.998 5.998 0 0 1 17 11a6 6 0 0 1-.585 2.587l1.477 1.477a8.001 8.001 0 0 0-3.446-11.286 1 1 0 0 0-.863 1.805zM18.778 18.778l-2.121-2.121-1.414-1.414-1.415-1.415L13 13l-2-2-3.889-3.889-3.889-3.889a.999.999 0 1 0-1.414 1.414L5.172 8H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1l4.188 3.35a.5.5 0 0 0 .812-.39v-3.131l2.587 2.587-.01.005a1 1 0 0 0 .86 1.806c.215-.102.424-.214.627-.333l2.3 2.3a1.001 1.001 0 0 0 1.414-1.416zM11 5.04a.5.5 0 0 0-.813-.39L8.682 5.854 11 8.172V5.04z"></path></svg>
                                </div>
                              </div>
                            }
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M10.188 4.65L6 8H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1l4.188 3.35a.5.5 0 0 0 .812-.39V5.04a.498.498 0 0 0-.812-.39zM14.446 3.778a1 1 0 0 0-.862 1.804 6.002 6.002 0 0 1-.007 10.838 1 1 0 0 0 .86 1.806A8.001 8.001 0 0 0 19 11a8.001 8.001 0 0 0-4.554-7.222z"></path><path d="M15 11a3.998 3.998 0 0 0-2-3.465v6.93A3.998 3.998 0 0 0 15 11z"></path></svg>
                            <div ref={el => this.$control_volumn_wrp = el} class="control_volumn_wrp">
                              {/* <span style="line-height:14px;">53</span> */}
                            </div>
                          </div>
                          <div class="control_setting control_btn" >
                            <div class="iconfont_setting" >
                              <div class="svgicon" onClick={() => this.data.showSettingPannel = !this.data.showSettingPannel}>
                                <svg viewBox="0 0 22 22">
                                  <circle cx="11" cy="11" r="2"></circle>
                                  <path d="M19.164 8.861L17.6 8.6a6.978 6.978 0 0 0-1.186-2.099l.574-1.533a1 1 0 0 0-.436-1.217l-1.997-1.153a1.001 1.001 0 0 0-1.272.23l-1.008 1.225a7.04 7.04 0 0 0-2.55.001L8.716 2.829a1 1 0 0 0-1.272-.23L5.447 3.751a1 1 0 0 0-.436 1.217l.574 1.533A6.997 6.997 0 0 0 4.4 8.6l-1.564.261A.999.999 0 0 0 2 9.847v2.306c0 .489.353.906.836.986l1.613.269a7 7 0 0 0 1.228 2.075l-.558 1.487a1 1 0 0 0 .436 1.217l1.997 1.153c.423.244.961.147 1.272-.23l1.04-1.263a7.089 7.089 0 0 0 2.272 0l1.04 1.263a1 1 0 0 0 1.272.23l1.997-1.153a1 1 0 0 0 .436-1.217l-.557-1.487c.521-.61.94-1.31 1.228-2.075l1.613-.269a.999.999 0 0 0 .835-.986V9.847a.999.999 0 0 0-.836-.986zM11 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"></path>
                                </svg>
                              </div>
                              <div class="control_setting_pannel" style={{display: this.data.showSettingPannel ? 'block' : 'none'}}>
                                <div class="control_setting_pannel_wrap">
                                  <div ref={el => this.$control_setting_pannel_speed = el} class="control_setting_pannel_speed">
                                    <span class="control_setting_pannel_demonstration">播放倍速</span>
                                  </div>
                                  <div ref={el => this.$control_setting_pannel_brightness = el} class="control_setting_pannel_brightness">
                                    <span class="control_setting_pannel_demonstration">画面亮度</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="control_repeat control_btn" onClick={this.handleRepeat}>
                            {
                              !this.data.repeat
                              ? <span class="iconfont_repeat_off control_repeat_on" >
                                <div class="svgicon">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M17 16H6v-2h1.793a.5.5 0 0 0 .354-.853l-2.793-2.793a.5.5 0 0 0-.707 0l-2.793 2.793a.5.5 0 0 0 .353.853H4v2a2 2 0 0 0 2 2h11a1 1 0 0 0 0-2zM19.793 8H18V6a2 2 0 0 0-2-2H5a1 1 0 0 0 0 2h11v2h-1.793a.5.5 0 0 0-.354.853l2.793 2.793a.5.5 0 0 0 .707 0l2.793-2.793A.5.5 0 0 0 19.793 8z"></path></svg>
                                </div>
                              </span>
                              : <span class="iconfont_repeat_on control_repeat_off" >
                                <div class="svgicon">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M3.222 3.222a.999.999 0 1 0-1.414 1.414l11.435 11.435H6v-2h1.793a.5.5 0 0 0 .354-.853l-2.793-2.793a.5.5 0 0 0-.707 0l-2.793 2.793a.5.5 0 0 0 .354.854H4v2a2 2 0 0 0 2 2h9.243l2.121 2.121a.999.999 0 1 0 1.414-1.414L3.222 3.222zM19.793 8.071H18v-2a2 2 0 0 0-2-2H6.899l2 2H16v2h-1.793a.5.5 0 0 0-.354.853l2.793 2.793a.5.5 0 0 0 .707 0l2.793-2.793a.5.5 0 0 0-.353-.853z"></path></svg>
                                </div>
                              </span>
                            }
                          </div>

                          <div class="control_fullscreen2 fullscreen2-on fullscreen2-off control_btn" onClick={this.handleFullScreen2}>
                            {
                              !this.data.fullScreen
                              ? <div class="">
                                <div class="svgicon">
                                  <svg viewBox="0 0 22 22"><path d="M9 3H4a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0V5h4a1 1 0 0 0 0-2zM18 12a1 1 0 0 0-1 1v4h-4a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z"></path></svg>
                                </div>
                              </div>
                              : <div class="">
                                <div class="svgicon">
                                  <svg viewBox="0 0 22 22"><path d="M9 3a1 1 0 0 0-1 1v4H4a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM18 12h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0v-4h4a1 1 0 0 0 0-2z"></path></svg>
                                </div>
                              </div>
                            }
                          </div>

                        </div>
                      </div>
                    </div>
                    <div class="control_bottom_comment" style={{display: this.data.showCommentControl ? 'block' : 'none'}}>
                      <div class="control_bottom_comment_inner">
                        <div class="control_comment_setting">
                          <div class="svgicon control_comment_setting_icon" onClick={() => this.data.showSettingDanmakuPannel = !this.data.showSettingDanmakuPannel}>
                            <svg viewBox="0 0 22 22">
                              <circle cx="11" cy="11" r="2"></circle>
                              <path d="M19.164 8.861L17.6 8.6a6.978 6.978 0 0 0-1.186-2.099l.574-1.533a1 1 0 0 0-.436-1.217l-1.997-1.153a1.001 1.001 0 0 0-1.272.23l-1.008 1.225a7.04 7.04 0 0 0-2.55.001L8.716 2.829a1 1 0 0 0-1.272-.23L5.447 3.751a1 1 0 0 0-.436 1.217l.574 1.533A6.997 6.997 0 0 0 4.4 8.6l-1.564.261A.999.999 0 0 0 2 9.847v2.306c0 .489.353.906.836.986l1.613.269a7 7 0 0 0 1.228 2.075l-.558 1.487a1 1 0 0 0 .436 1.217l1.997 1.153c.423.244.961.147 1.272-.23l1.04-1.263a7.089 7.089 0 0 0 2.272 0l1.04 1.263a1 1 0 0 0 1.272.23l1.997-1.153a1 1 0 0 0 .436-1.217l-.557-1.487c.521-.61.94-1.31 1.228-2.075l1.613-.269a.999.999 0 0 0 .835-.986V9.847a.999.999 0 0 0-.836-.986zM11 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"></path>
                            </svg>
                          </div>
                          <div class="control_bottom_comment_setting_pannel" style={{display: this.data.showSettingDanmakuPannel ? 'block' : 'none'}}>
                            <div class="control_bottom_comment_setting_color comment_setting_item">
                              <span>颜色</span>
                              <div style="width:70%;float:right;" ref={el => this.$color_container = el} onClick={this.handlePickColor}>
                                <a class="control_bottom_comment_setting_color_white control_bottom_setting_color--picked" ></a>
                                <a class="control_bottom_comment_setting_color_green" ></a>
                                <a class="control_bottom_comment_setting_color_pink" ></a>
                                <a class="control_bottom_comment_setting_color_blue" ></a>
                                <a class="control_bottom_comment_setting_color_purple" ></a>
                                <a class="control_bottom_comment_setting_color_red" ></a>

                                <a class="control_bottom_comment_setting_color_vip" ></a>
                              </div>
                            </div>

                            <div class="control_bottom_comment_setting_path_wrap comment_setting_item">
                              <span>路径</span>
                              <div style="width:70%;float:right;" ref={el => this.$path_container = el} onClick={this.handlePickMode}>
                                <div class="setting_path_linear setting_path setting_path--picked" data-path="linear">
                                </div>
                                <div class="setting_path_sin setting_path" data-path="curve">
                                </div>
                                <div class="setting_path_fix setting_path" data-path="fixed">
                                </div>
                              </div>
                            </div>
                            <div ref={el => this.$setting_alpah = el} class="setting_alpah comment_setting_item">
                              <span>透明</span>
                            </div>

                            <div ref={el => this.$setting_fontsize = el} class="setting_fontsize comment_setting_item">
                              <span>字号</span>
                            </div>

                          </div>
                        </div>
                        <div class="control_bottom_comment_input_wrap">
                          <input ref={el => { this.$control_bottom_comment_input = el }} onFocus={this.handleIptFocus} onBlur={this.handleIptBlur} class="control_bottom_comment_input" type="text" placeholder="发送弹幕OuO" maxlength="30"/>
                        </div>
                        <div class="control_bottom_comment_send" onClick={this.handleComment}>
                          发送
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="control_side">
                    {
                      this.props.showComment && props.enableSendDanmaku &&
                      <div class="control_btn control_comment" onClick={this.handleCommentSwitch}>
                        <div class="iconfont_comment">
                          <div class="svgicon">
                            <svg version="1.1" viewBox="0 0 32 32"><path d="M27.128 0.38h-22.553c-2.336 0-4.229 1.825-4.229 4.076v16.273c0 2.251 1.893 4.076 4.229 4.076h4.229v-2.685h8.403l-8.784 8.072 1.566 1.44 7.429-6.827h9.71c2.335 0 4.229-1.825 4.229-4.076v-16.273c0-2.252-1.894-4.076-4.229-4.076zM28.538 19.403c0 1.5-1.262 2.717-2.819 2.717h-8.36l-0.076-0.070-0.076 0.070h-11.223c-1.557 0-2.819-1.217-2.819-2.717v-13.589c0-1.501 1.262-2.718 2.819-2.718h19.734c1.557 0 2.819-0.141 2.819 1.359v14.947zM9.206 10.557c-1.222 0-2.215 0.911-2.215 2.036s0.992 2.035 2.215 2.035c1.224 0 2.216-0.911 2.216-2.035s-0.992-2.036-2.216-2.036zM22.496 10.557c-1.224 0-2.215 0.911-2.215 2.036s0.991 2.035 2.215 2.035c1.224 0 2.215-0.911 2.215-2.035s-0.991-2.036-2.215-2.036zM15.852 10.557c-1.224 0-2.215 0.911-2.215 2.036s0.991 2.035 2.215 2.035c1.222 0 2.215-0.911 2.215-2.035s-0.992-2.036-2.215-2.036z"></path></svg>
                          </div>
                        </div>
                      </div>
                    }

                    {
                      props.screenshot === 'true' &&
                      <div class="control_btn control_screenshot">
                        <div class="iconfont_screenshot">
                          <div class="svgicon">
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M16 23c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM16 13c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM27 28h-22c-1.654 0-3-1.346-3-3v-16c0-1.654 1.346-3 3-3h3c0.552 0 1 0.448 1 1s-0.448 1-1 1h-3c-0.551 0-1 0.449-1 1v16c0 0.552 0.449 1 1 1h22c0.552 0 1-0.448 1-1v-16c0-0.551-0.448-1-1-1h-11c-0.552 0-1-0.448-1-1s0.448-1 1-1h11c1.654 0 3 1.346 3 3v16c0 1.654-1.346 3-3 3zM24 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5zM15 4c0 0.552-0.448 1-1 1h-4c-0.552 0-1-0.448-1-1v0c0-0.552 0.448-1 1-1h4c0.552 0 1 0.448 1 1v0z"></path></svg>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
              </div>
            </div>

          }

        </section>
      </div>

    )
  }

  updateBuffProgress ($video) {
    // console.log($video,'buff')

    if (!$video.buffered.length) return

    var bufferedEnd = $video.buffered.end($video.buffered.length - 1)
    var duration = $video.duration

    if (duration > 0) {
      // console.log(bufferedEnd / duration)
      this.data.buffPercent = bufferedEnd / duration
    }
  }
  updateCurrentProgress ($video) {
    var [ mm, ss ] = mmss($video.currentTime | 0)
    this.data.currentTime = { mm, ss }

    if (!this.slideDotDrag){
      this.data.currentPercent = $video.currentTime / $video.duration
      this.data.sliderDotProgress = this.data.currentPercent
    }

    ;[mm, ss] = mmss($video.duration | 0)
    this.data.totalTime = { mm, ss }
  }
  handleChangeCurrent = (e) => {
    var { onChangeCurrent, onplayStart } = this.props
    var { left, width } = this.$control_bottom_t_progress_slider.getBoundingClientRect()

    let x = e.pageX - left
    let percent = x / width
    // debugger

    onChangeCurrent(percent)

    if (!this.props.play) {
      onplayStart()
    }
  }
  css () {
    return require('./_control-wrap.less')
  }
  handleClick = (e) => {
    var { target: $target } = e
    if (this.slideDotDrag) return

    var { onplayChange } = this.props

    var cl = $target.classList

    if (cl.contains('ui') || cl.contains('control_side') || cl.contains('control_wrap')) {
      if (this.data.showCommentControl){
        // debugger
        this.handleCommentSwitch()

        // console.log('showCommentControl...')

        return
      }

      // debugger
      onplayChange()
      this.data.showUi = true
      clearTimeout(this.itvMove)
      this.itvMove = setTimeout(() => {
        this.data.showUi = false
      }, 1233)
    }

    // debugger
  }
  handleMouseMove = (e) => {
    this.data.showUi = true
    clearTimeout(this.itvMove)
    // console.log('move')

    var { target: $target } = e

    if ($target.classList.contains('ui') || $target.classList.contains('control_side')) {
      // console.log('contaains ui')
      this.itvMove = setTimeout(() => {
        this.data.showUi = false
      }, 1233)
    }
  }
  handleMouseEnter = () => {
    this.data.showUi = true
  }
  handleMouseLeave = () => {
    this.data.showUi = false
  }
  handlePickMode = (e) => {
    if (!e.target.getAttribute('data-path')) return
    var $paths = [...this.$path_container.children]

    $paths.forEach($co => {
      $paths.forEach($co => $co.classList.remove('setting_path--picked'))
    })
    e.target.classList.add('setting_path--picked')

    this.data.danmakuMode = e.target.getAttribute('data-path')
  }
  handlePickColor = (e) => {
    // console.log(e.target)

    if (e.target.nodeName.toLowerCase() !== 'a') return
    var $colors = [...this.$color_container.querySelectorAll('a')]
    e.preventDefault()
    $colors.forEach($co => {
      $colors.forEach($co => $co.classList.remove('control_bottom_setting_color--picked'))
    })
    e.target.classList.add('control_bottom_setting_color--picked')

    this.data.danmakuColor = window.getComputedStyle(e.target, null)['background-color']
  }
  handleSliderMouseOut = () => {
    this.data.showThumbnail = false
  }
  handleSliderMouseOver = () => {
    this.data.showThumbnail = true
  }
  handleSliderMouseMove = (e) => {
    if (!this.props.thumbnailtile || !this.props.thumbnail) return

    var { left, width } = this.$control_bottom_t_progress_slider.getBoundingClientRect()

    var { onSliderMouseMove } = this.props
    let x = e.pageX - left
    let progress = x / width
    // console.log(this.props.thumbnailtile)

    let num_of_tile = this.props.thumbnailtile * 1
    const w_of_tile = 160
    let tile = progress * num_of_tile | 0
    this.data.thumbnailBackgroundPositionX = -tile * w_of_tile + 'px'
    this.data.thumbnailLeft = progress * 100 + '%'
    onSliderMouseMove(progress)
  }
  handleComment = () => {
    var { onComment } = this.props
    var text = this.$control_bottom_comment_input.value.trim()
    if (!text.length) return
    // debugger
    window.localStorage['danmaku-player-OuO__last-input'] = text
    // {mode:'linear', fill:0xff00ff, fontSize: 23, alpha: 1 }
    // console.log(this.data.danmakuAlpha, this.data.danmakuColor, this.data.danmakuFontSize, this.data.danmakuMode)
    onComment(text, {mode: this.data.danmakuMode, fontSize: this.data.danmakuFontSize * 1, fill: this.data.danmakuColor, alpha: this.data.danmakuAlpha * 1})
    this.$control_bottom_comment_input.value = ''
  }
  handleVolumn = () => {
    this.data.offVolumn = !this.data.offVolumn

    if (this.data.offVolumn) {
      this.$sliderVolumn.offValue()
    } else {
      this.$sliderVolumn.onValue()
    }
  }
  handleRepeat = () => {
    var { onrepeatChange } = this.props
    this.data.repeat = !this.data.repeat
    onrepeatChange(this.data.repeat)
  }
  handleFullScreen2 = () => {
    if (this.data.fullScreen){
      this.exitFullscreen()
    } else {
      this.requestFullScreen()
    }
  }
  handlePlay = (e) => {
    // var { onplayChange } = this.props
    // onplayChange()

    var { onplayChange } = this.props
    onplayChange()
  }

  clearItv () {
    clearTimeout(this.itv4)
    clearTimeout(this.itv5)
  }
  clearHandle () {
    this.handleFullScreen = null
    this.handleExitFullScreen = null
  }
  onRequestFullScreen (fn) {
    this.handleFullScreen = fn
  }
  onExitFullScreen (fn) {
    this.handleExitFullScreen = fn
  }
  requestFullScreen = () => {
    var { $playerRoot, onrequestFullScreen } = this.props
    $playerRoot.requestFullscreen()
    this.onRequestFullScreen(() => {
      this.clearHandle()
      // debugger
      onrequestFullScreen()
    })
  }
  exitFullscreen () {
    var { onrequestNormalScreen } = this.props
    document.exitFullscreen()
    this.onExitFullScreen(() => {
      this.clearHandle()
      onrequestNormalScreen()
    })
  }
  handleCommentSwitch = () => {
    this.data.showCommentControl = !this.data.showCommentControl

    this.data.showSettingPannel =
    this.data.showSettingDanmakuPannel = false
  }
  handleDanmakuSwitch = () => {
    var { onSwitchDanamku } = this.props
    this.data.offDanmaku = !this.data.offDanmaku
    onSwitchDanamku(this.data.offDanmaku)
  }
  receiveProps (parentProps, b, c){

    // this.data.play = parentProps.play
    // debugger
    // console.log('receiveProps',parentProps.play, b.play)
  }
  dragProgressDot () {
    var { onChangeCurrent } = this.props
    var $el = this.$control_bottom_t_progress_slider_dot

    var fac = 0
    $el.addEventListener('mousedown', e => {
      $el.mousdown = true
    })

    window.addEventListener('mouseup', e => {
      if (!$el.mousdown) return
      this.slideDotDrag = false
      // console.log('mouseup!!!!',fac)
      $el.mousdown = false
      onChangeCurrent(fac)
    })
    window.addEventListener('mousemove', e => {
      var pageX = e.pageX
      var pageY = e.pageY

      if ($el.mousdown) {
        let {
          left, right, width, x,
          top, bottom, height, y
        } = this.$control_bottom_t_progress_slider.getBoundingClientRect()

        if (pageX < left) pageX = left
        if (pageX > right) pageX = right

        fac = (pageX - x) / width

        this.slideDotDrag = true
        // onChangeCurrent(fac)
        // console.log(fac)
        // this.currentPercent = 1
        this.data.sliderDotProgress = fac
      }
    })
  }
  handleIptFocus = () => {
    // console.log('focus!')
    this.iptFocus = true
  }
  handleIptBlur = () => {
   // console.log('blur!')
    this.iptFocus = false
  }
  install () {
    this.itv4 = null
    this.itv5 = null

   // console.log(this.props)

    this.data = {
      fullScreen: false,
      repeat: true,
      currentTime: {
        mm: '00',
        ss: '00'
      },
      totalTime: {
        mm: '00',
        ss: '00'
      },
      currentPercent: 0,
      buffPercent: 0,
      sliderDotProgress: 0,

      offDanmaku: false,
      offVolumn: false,
      showUi: false,
      showCommentControl: false,
      showSettingPannel: false,
      showSettingDanmakuPannel: false,

      thumbnailBackgroundPositionX: '0px',
      thumbnailLeft: '0%',
      showThumbnail: false,

      danmakuColor: 'rgb(255,255,255)',
      danmakuMode: 'linear',
      danmakuAlpha: 1,
      danmakuFontSize: 18
    }
  }

  installed () {
    var { onspeedChange, onbrightnessChange, onscaleChange, onvolumnChange } = this.props
    var ls = window.localStorage
    Slider(this.$control_setting_pannel_speed, [0, 100, 25]).onChange(v => {
      v = .1 + v / 100 * 3.9
      // console.log(v)
      onspeedChange(v)
    })
		Slider(this.$control_setting_pannel_brightness, [0, 100, 50]).onChange(v => {
      v = .1 + v / 100 * 1.9
      // console.log(v)
      onbrightnessChange(v)
    })
    // Slider(this.$control_setting_pannel_scale, [0, 100, 100]).onChange(v => {
    //   v = .1 + v / 100 * 0.9
    //   console.log(v)
    //   onscaleChange(v)
    // })
    var $sliderVolumn = Slider(this.$control_volumn_wrp, [0, 100, 100], true)
    $sliderVolumn.onChange(v => {
      v = v / 100 * 1
      // console.log(v)
      onvolumnChange(v)
    })
    Object.assign($sliderVolumn.$el.style, {
      float: 'none', height: '85%', marginTop: '8px'
    })

    this.$sliderVolumn = $sliderVolumn

    Slider(this.$setting_alpah, [0, 100, 100]).onChange(v => {
      // console.log(v)
      v = v / 100 * 1
      // console.log(v)
      this.data.danmakuAlpha = v
    })
    Slider(this.$setting_fontsize, [0, 100, 50]).onChange(v => {
      v = 12 + v / 100 * (40 - 12)
      // console.log(v)
      this.data.danmakuFontSize = v
    })

    this.dragProgressDot()
    window.addEventListener('keydown', e => {
      if (e.keyCode === 13) {
        if (this.iptFocus) {
          this.handleComment()
        }
      }
      if (e.keyCode === 38){
        if (this.iptFocus) {
          let lastIptTex
          if (lastIptTex = ls['danmaku-player-OuO__last-input']){
            this.$control_bottom_comment_input.value = lastIptTex
          }
        }
      }
    })
    window.addEventListener('fullscreenchange', e => {
      // 需要全屏
      if (!this.data.fullScreen){
        this.clearItv()

        this.itv4 = setTimeout(() => {
          this.handleFullScreen && this.handleFullScreen()
        }, 123)

        this.data.fullScreen = true
      } else {
        this.clearItv()
        this.itv5 = setTimeout(() => {
          if (this.handleExitFullScreen){
            this.handleExitFullScreen()
          } else {
            // this.normalScreen = true
            this.props.onrequestNormalScreen()
          }
        }, 123)

        this.data.fullScreen = false
      }
    })
  }
})
