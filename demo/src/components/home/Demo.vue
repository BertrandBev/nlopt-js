<template lang="pug">
div(:style='layoutStyle')
  div(ref='figure')
  span.white--text.mt-2(style='font-style: italic;')
    | The Rosenbrock function, constrained inside a circle
</template>

<script>
import Two from "two.js";
import nlopt from "@nlopt";
import { getTex } from "@/components/texUtils.js";
import anime from "animejs";
import _ from "lodash";
import Plotly from "plotly.js-dist";

export default {
  data: () => ({
    size: [512, 512],
    loopTimeout: null,
    traceTimeout: null,
    trace: [],
    bounds: {
      x: [-1.5, 1.5],
      y: [-1.5, 1.5]
    }
  }),

  computed: {
    layoutStyle() {
      return {
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        "flex-direction": "column"
      };
    },

    largeScreen() {
      return this.$store.windowSize.x > 768;
    }
  },

  mounted() {
    // Solve optim
    this.plotFun();
    this.loop();

    // Start loop
    // this.loop();
  },

  destroyed() {
    if (this.loopTimeout) clearTimeout(this.loopTimeout);
    if (this.traceTimeout) clearTimeout(this.traceTimeout);
  },

  methods: {
    pickPoint() {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * 1.5;
      return [r * Math.cos(angle), r * Math.sin(angle)];
    },

    plotFun() {
      // Setup figure
      const size = 100;
      const x = new Array(size);
      const y = new Array(size);
      const z = new Array(size);
      for (let i = 0; i < size; i++) {
        x[i] =
          this.bounds.x[0] + ((this.bounds.x[1] - this.bounds.x[0]) * i) / size;
        y[i] =
          this.bounds.y[0] + ((this.bounds.y[1] - this.bounds.y[0]) * i) / size;
        z[i] = new Array(size);
      }
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          z[i][j] = this.f(x[i], y[j]);
        }
      }
      const data = [
        {
          z: z,
          x: x,
          y: y,
          type: "contour",
          showscale: false
        },
        {
          x: [],
          y: [],
          mode: "lines+markers",
          line: {
            color: "orange"
          }
        }
      ];
      const config = {
        displayModeBar: false
      };
      const layout = {
        height: this.size[0],
        width: this.size[1],
        xaxis: {
          range: this.bounds.x,
          showgrid: false,
          zeroline: false,
          ticks: "",
          showticklabels: false
        },
        yaxis: {
          range: this.bounds.y,
          showgrid: false,
          zeroline: false,
          ticks: "",
          showticklabels: false,
          scaleanchor: "x",
          scaleratio: 1
        },
        margin: {
          l: 10,
          r: 10,
          b: 10,
          t: 10
        },
        hovermode: false,
        // paper_bgcolor: '#00000000',
        plot_bgcolor: "#00000000",
        shapes: [
          {
            type: "circle",
            xref: "x",
            yref: "y",
            x0: -Math.sqrt(2),
            y0: -Math.sqrt(2),
            x1: Math.sqrt(2),
            y1: Math.sqrt(2),
            line: {
              color: "white",
              dash: "dot"
            }
          }
        ]
      };
      Plotly.newPlot(this.$refs.figure, data, layout, config);
    },

    // plotTrace() {
    //   const data = [
    //     {
    //       x: this.trace
    //         .map(pt => pt[0])
    //         .filter(x => x > this.bounds.x[0] && x < this.bounds.x[1]),
    //       y: this.trace
    //         .map(pt => pt[1])
    //         .filter(y => y > this.bounds.y[0] && y < this.bounds.y[1])
    //     }
    //   ];
    //   Plotly.update(this.$refs.figure, {
    //     data: data,
    //     traces: [1]
    //   });
    // },

    f(x, y) {
      return Math.pow(1 - x, 2) + 100 * Math.pow(y - Math.pow(x, 2), 2);
    },

    c(x, y) {
      return Math.pow(x[0], 2) + Math.pow(x[1], 2) - 2;
    },

    solve(x0) {
      // const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
      const opt = new nlopt.Optimize(nlopt.Algorithm.LD_SLSQP, 2);
      this.trace = [];
      // Set min objective
      opt.setMinObjective((x, grad) => {
        if (
          x[0] > this.bounds.x[0] &&
          x[0] < this.bounds.x[1] &&
          x[1] > this.bounds.y[0] &&
          x[1] < this.bounds.y[1]
        )
          this.trace.push(_.cloneDeep(x));
        if (grad) {
          grad[0] = 2 * x[0] - 400 * x[0] * (x[1] - Math.pow(x[0], 2)) - 2;
          grad[1] = 200 * (x[1] - Math.pow(x[0], 2));
        }
        return (
          Math.pow(1 - x[0], 2) + 100 * Math.pow(x[1] - Math.pow(x[0], 2), 2)
        );
      }, 1e-4);
      // Set constraint
      opt.addInequalityConstraint((x, grad) => {
        if (grad) {
          grad[0] = 2 * x[0];
          grad[1] = 2 * x[1];
        }
        return Math.pow(x[0], 2) + Math.pow(x[1], 2) - 2;
      }, 1e-4);
      // Optimize
      opt.setMaxeval(1000);
      console.log("optimize:", x0);
      const res = opt.optimize(x0);
      console.log("optimization done!", res);
    },

    loop() {
      const x0 = this.pickPoint();
      this.solve(x0);
      Plotly.extendTraces(this.$refs.figure, {
          x: [[]],
          y: [[]]
        }, [1], 0);
      this.traceLoop();

      this.loopTimeout = setTimeout(this.loop, 4000);
    },

    traceLoop() {
      const time = 2000;
      const dt = Math.max(1, time / this.trace.length);
      if (this.trace.length > 0) {
        const x = this.trace.shift();
        Plotly.extendTraces(this.$refs.figure, {
          x: [[x[0]]],
          y: [[x[1]]]
        }, [1]);
        this.traceTimeout = setTimeout(this.traceLoop, dt);
      }
    }
  }
};
</script>