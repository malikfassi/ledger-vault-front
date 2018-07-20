//@flow
import React from "react";
import type { Translate } from "data/types";
import { translate } from "react-i18next";
import DialogButton from "components/buttons/DialogButton";
import Footer from "./Footer";
import { Title, Introduction, SubTitle } from "components/Onboarding";

import { withStyles } from "@material-ui/core/styles";
import { RequirementUnit, BlueDevice } from "./Requirements";
import People from "components/icons/thin/People.js";

const styles = {
  requirements: {
    display: "flex",
    fontSize: 11,
    lineHeight: 1.82,
    justifyContent: "space-between",
    marginBottom: 40
  },
  notrequired: {
    opacity: 0.5,
    position: "relative",
    "&:before": {
      content: '""',
      position: "absolute",
      width: 1,
      height: 80,
      background: "#eeeeee",
      left: -30,
      top: 30
    }
  },
  flexcolumn: {
    display: "flex"
  }
};
const Prerequisite = ({
  classes,
  t
}: {
  classes: { [$Keys<typeof styles>]: string },
  t: Translate
}) => {
  return (
    <div>
      <Title>{t("onboarding:wrapping_key_prerequisite.title")}</Title>
      <Introduction>
        {t("onboarding:wrapping_key_prerequisite.description")}
      </Introduction>
      <div className={classes.requirements}>
        <div>
          <SubTitle>{t("onboarding:required")}</SubTitle>
          <div className={classes.flexcolumn}>
            <RequirementUnit icon={<BlueDevice color="orange" />}>
              <div style={{ width: 96 }}>{t("onboarding:blue_orange")}</div>
            </RequirementUnit>
            <RequirementUnit
              icon={<People color="#cccccc" style={{ height: 29 }} />}
            >
              <div style={{ width: 93 }}>{t("onboarding:wkey_custodians")}</div>
            </RequirementUnit>
          </div>
        </div>
        <div className={classes.notrequired}>
          <SubTitle>{t("onboarding:not_required")}</SubTitle>
          <div className={classes.flexcolumn}>
            <RequirementUnit
              icon={<People color="#cccccc" style={{ height: 29 }} />}
            >
              <div style={{ width: 96 }}>{t("onboarding:administrators")}</div>
            </RequirementUnit>
            <RequirementUnit
              icon={<People color="#cccccc" style={{ height: 29 }} />}
              style={{ width: 76 }}
            >
              <div>
                {t("onboarding:wrapping_key_prerequisite.shared_owners")}
              </div>
            </RequirementUnit>
          </div>
        </div>
      </div>
      <Footer
        render={onNext => (
          <DialogButton highlight onTouchTap={onNext}>
            {t("common:continue")}
          </DialogButton>
        )}
      />
    </div>
  );
};

export default withStyles(styles)(translate()(Prerequisite));