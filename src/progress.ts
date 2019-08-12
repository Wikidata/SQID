import NProgress from 'nprogress'

class ProgressState {
  private state: number = 0

  public start() {
    if (this.state <= 0) {
      NProgress.start()
    }

    ++this.state
  }

  public done(forceShow = false) {
    this.state = Math.max(0, this.state - 1)

    if (this.state) {
      NProgress.inc()
    } else {
      NProgress.done(forceShow)
    }
  }
}

const progressState = new ProgressState()
export default progressState
