export function Slider ($holder, [min, max, defaultValue], vertical = false) {
  var html = (htmls) => htmls

  var render = () => {
    if (!vertical) {
      that.$el.innerHTML = html`
        <div class="el-slider__runway" >
          <div class="el-slider__bar" style="width: 0%; left: 0%;"></div>
          <div class="el-slider__button-wrapper" style="left: 0%;">
            <div class="el-tooltip">
              <div class="el-tooltip__rel">
                <div>
                  <div class="el-slider__button"></div>
                </div>
              </div>
              <div class="el-tooltip__popper is-dark" style="position: absolute; will-change: top, left; top: -34px; left: 1px; "
                x-placement="top">
                <div><span>22</span></div>
                <div class="popper__arrow" x-arrow="" style="left: 11px;"></div>
              </div>
            </div>
          </div>
        </div>
      `
    } else {
      that.$el.innerHTML = html`
        <div class="el-slider__runway" style="height:100%;margin:0 auto;">
          <div class="el-slider__bar" style="height: 67%; bottom: 0%;"></div>
          <div class="el-slider__button-wrapper" style="bottom: 67%;">
            <div class="el-tooltip">
              <div class="el-tooltip__rel">
                <div>
                  <div class="el-slider__button"></div>
                </div>
              </div>
              <div  class="el-tooltip__popper is-dark" x-placement="top"
                style="position: absolute; will-change: top, left;  top: -33px; left: 3px;">
                <div><span>67</span></div>
                <div class="popper__arrow" x-arrow="" style="left: 6px;"></div>
              </div>
            </div>
          </div>
        </div>  
      `
    }
  }
  var setValue = (fac, record = true) => {
    if (record) recordValue = fac
    if (vertical) {
      that.$slider.style.bottom = fac * 100 + '%'
      that.$tooltipCon.textContent = Math.round(min + fac * (max - min))
      that.$bar.style.height = fac * 100 + '%'
    } else {
      // that.$slider.style.left = fac * 100 + '%'
      // that.$tooltipCon.textContent =   Math.round( min + fac * (max - min) )
      // that.$bar.style.width = fac * 100 + '%'
      that.$slider.style.left = fac * 100 + '%'
      that.$tooltipCon.textContent = (min + fac * (max - min)).toFixed(1)
      that.$bar.style.width = fac * 100 + '%'
    }

    that.handle_change && that.handle_change(that.$tooltipCon.textContent)
  }

  var onValue = () => {
    setValue(recordValue, false)
  }
  var offValue = () => {
    setValue(0, false)
  }

  var recordValue
  var init = () => {
    that.$el.classList.add('el-slider')
    if (vertical) {
      that.$el.classList.add('is-vertical')
      that.$el.style.width = '100%'
    }

    that.$holder.insertAdjacentElement('beforeend', that.$el)

    render()

    var $runway = that.$runway = that.$el.querySelector('.el-slider__runway')
    var $slider = that.$slider = that.$el.querySelector('.el-slider__button-wrapper')
    var $tooltipCon = that.$tooltipCon = that.$el.querySelector('.el-tooltip__popper span')
    var $bar = that.$bar = that.$el.querySelector('.el-slider__bar')

    that.defaultValue = Math.max(defaultValue, that.min)
    that.defaultValue = Math.min(defaultValue, that.max)

    // return
    var min_ = 0
    var max_ = max

    if (that.min < 0) {
      max_ += that.min * -1
      that.defaultValue += that.min * -1
    } else {
      max_ += that.min
      that.defaultValue -= that.min
    }

    var fac = that.defaultValue / (max_ - min_)

    setValue(fac)
    // vetical slider@bottom bar@height
    // left width

    $slider.addEventListener('mousedown', e => {
      $slider.mousdown = true
    })

    window.addEventListener('mouseup', e => {
      $slider.mousdown = false
    })
    window.addEventListener('mousemove', e => {
      var pageX = e.pageX
      var pageY = e.pageY

      if ($slider.mousdown) {
        let {
          left, right, width, x,
          top, bottom, height, y
        } = $runway.getBoundingClientRect()

        let fac

        if (pageX < left) pageX = left
        if (pageX > right) pageX = right

        if (pageY < top) pageY = top
        if (pageY > bottom) pageY = bottom

        if (vertical) {
          fac = 1 - (pageY - y) / height
        } else {
          fac = (pageX - x) / width
        }

        setValue(fac)
      }
    })
  }
  var that = {
    onChange (fn) {
      this.handle_change = fn
    },
    min,
    max,
    defaultValue,
    setValue,
    offValue,
    onValue,
    $holder: typeof $holder === 'string' ? document.querySelector($holder) : $holder,
    $el: document.createElement('div')
  }
  init()
  return that
}

export function mmss (second) {
  var m = (second / 60 % 60) | 0
  var s = (second % 60) | 0
  if (m < 10) m = '0' + m
  if (s < 10) s = '0' + s
  return [m, s]
}
