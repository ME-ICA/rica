import ReactDOM from "react-dom";
import React, { Component } from "react";

import Tabs from "./Tabs";
import Panel from "./Panel";
import CarpetOption from "./CarpetOption";
import Plots from "./Plots";

import "./styles.css";

const carpetsjson = [
  { name: "Optimally combined", path: "/figures/carpet_optcom.svg" },
  { name: "Denoised", path: "/figures/carpet_denoised.svg" },
  { name: "Accepted", path: "/figures/carpet_accepted.svg" },
  { name: "Rejected", path: "/figures/carpet_rejected.svg" },
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      carpetpath: "./figures/carpet_optcom.svg",
    };
  }

  onChange = (e) => {
    this.setState({ carpetpath: e.target.value });
  };

  render() {
    const { carpetpath } = this.state;

    return (
      <div className="main-container">
        <div style={{ marginLeft: "33px" }}>
          <a href="https://github.com/ME-ICA/tedana" className="title">
            tedana
          </a>
        </div>
        <Tabs>
          <Panel title="ICA">
            <Plots />
          </Panel>
          <Panel title="Carpets">
            <center>
              <select className="dd-menu" onChange={this.onChange}>
                {carpetsjson.map((carpet, key) => (
                  <CarpetOption
                    key={key}
                    name={carpet.name}
                    path={carpet.path}
                  />
                ))}
              </select>
              <div className="carpet-plots-image">
                <img id="imgCarpetPlot" alt="" src={carpetpath} />
              </div>
            </center>
          </Panel>
          <Panel title="Info">
            <p className="info">
              TE-dependence analysis was performed on input data. A user-defined
              mask was applied to the data. An adaptive mask was then generated,
              in which each voxel's value reflects the number of echoes with
              'good' data. A monoexponential model was fit to the data at each
              voxel using log-linear regression in order to estimate T2* and S0
              maps. For each voxel, the value from the adaptive mask was used to
              determine which echoes would be used to estimate T2* and S0.
              Multi-echo data were then optimally combined using the T2*
              combination method (Posse et al., 1999). Principal component
              analysis based on the PCA component estimation with a Moving
              Average(stationary Gaussian) process (Li et al., 2007) was applied
              to the optimally combined data for dimensionality reduction. The
              following metrics were calculated: kappa, rho, countnoise,
              countsigFT2, countsigFS0, dice_FT2, dice_FS0, signal-noise_t,
              variance explained, normalized variance explained, d_table_score.
              Kappa (kappa) and Rho (rho) were calculated as measures of
              TE-dependence and TE-independence, respectively. A t-test was
              performed between the distributions of T2*-model F-statistics
              associated with clusters (i.e., signal) and non-cluster voxels
              (i.e., noise) to generate a t-statistic (metric signal-noise_z)
              and p-value (metric signal-noise_p) measuring relative association
              of the component to signal over noise. The number of significant
              voxels not from clusters was calculated for each component.
              Independent component analysis was then used to decompose the
              dimensionally reduced dataset. The following metrics were
              calculated: kappa, rho, countnoise, countsigFT2, countsigFS0,
              dice_FT2, dice_FS0, signal-noise_t, variance explained, normalized
              variance explained, d_table_score. Kappa (kappa) and Rho (rho)
              were calculated as measures of TE-dependence and TE-independence,
              respectively. A t-test was performed between the distributions of
              T2*-model F-statistics associated with clusters (i.e., signal) and
              non-cluster voxels (i.e., noise) to generate a t-statistic (metric
              signal-noise_z) and p-value (metric signal-noise_p) measuring
              relative association of the component to signal over noise. The
              number of significant voxels not from clusters was calculated for
              each component. Next, component selection was performed to
              identify BOLD (TE-dependent), non-BOLD (TE-independent), and
              uncertain (low-variance) components using the Kundu decision tree
              (v2.5; Kundu et al., 2013). This workflow used numpy (Van Der
              Walt, Colbert, & Varoquaux, 2011), scipy (Jones et al., 2001),
              pandas (McKinney, 2010), scikit-learn (Pedregosa et al., 2011),
              nilearn, and nibabel (Brett et al., 2019). This workflow also used
              the Dice similarity index (Dice, 1945; Sørensen, 1948).
              References: Brett, M., Markiewicz, C. J., Hanke, M., Côté, M.-A.,
              Cipollini, B., McCarthy, P., … freec84. (2019, May 28).
              nipy/nibabel. Zenodo. http://doi.org/10.5281/zenodo.3233118 Dice,
              L. R. (1945). Measures of the amount of ecologic association
              between species. Ecology, 26(3), 297-302. Jones E, Oliphant E,
              Peterson P, et al. SciPy: Open Source Scientific Tools for Python,
              2001-, http://www.scipy.org/ Kundu, P., Brenowitz, N. D., Voon,
              V., Worbe, Y., Vértes, P. E., Inati, S. J., ... & Bullmore, E. T.
              (2013). Integrated strategy for improving functional connectivity
              mapping using multiecho fMRI. Proceedings of the National Academy
              of Sciences, 110(40), 16187-16192. Li, Y.O., Adalı, T. and
              Calhoun, V.D., (2007). Estimating the number of independent
              components for functional magnetic resonance imaging data. Human
              brain mapping, 28(11), pp.1251-1266. McKinney, W. (2010, June).
              Data structures for statistical computing in python. In
              Proceedings of the 9th Python in Science Conference (Vol. 445, pp.
              51-56). Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V.,
              Thirion, B., Grisel, O., ... & Vanderplas, J. (2011).
              Scikit-learn: Machine learning in Python. Journal of machine
              learning research, 12(Oct), 2825-2830. Posse, S., Wiese, S.,
              Gembris, D., Mathiak, K., Kessler, C., Grosse‐Ruyken, M. L., ... &
              Kiselev, V. G. (1999). Enhancement of BOLD‐contrast sensitivity by
              single‐shot multi‐echo functional MR imaging. Magnetic Resonance
              in Medicine: An Official Journal of the International Society for
              Magnetic Resonance in Medicine, 42(1), 87-97. Sørensen, T. J.
              (1948). A method of establishing groups of equal amplitude in
              plant sociology based on similarity of species content and its
              application to analyses of the vegetation on Danish commons. I
              kommission hos E. Munksgaard. Van Der Walt, S., Colbert, S. C., &
              Varoquaux, G. (2011). The NumPy array: a structure for efficient
              numerical computation. Computing in Science & Engineering, 13(2),
              22.
            </p>
          </Panel>
        </Tabs>
      </div>
    );
  }
}

export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
