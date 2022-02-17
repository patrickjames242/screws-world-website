import React from "react";
import { Link } from "react-router-dom";
import {
  SelectionType as NavBarSelection,
  getInfoForSelection,
} from "random-components/NavBar/SelectionType";

import "./Home.scss";

import customerServiceIcon from "assets/home-screen-images/icon-people.png";
import priceIcon from "assets/home-screen-images/price.png";
import toolsIcon from "assets/home-screen-images/tools.png";
import quotesIcon from "./quotes-icon.js";
import { useSetTitleFunctionality } from "jshelpers";
import ScrewsWorldLocationMap from "random-components/ScrewsWorldLocationMap/ScrewsWorldLocationMap";

export default function Home() {
  useSetTitleFunctionality("Home");

  return (
    <div className="Home">
      <ShowCase />
      <FeaturesBox />
      <AdditionalInfoBox />
      <ReviewsSection />
      <MapSection />
    </div>
  );
}

function ShowCase() {
  const S = NavBarSelection;
  const aboutUsPath = getInfoForSelection(S.AboutUs).routePath;
  const productsPath = getInfoForSelection(S.Products).routePath;

  return (
    <div className="ShowCase">
      <div className="background-view"></div>
      <div className="center-content">
        <h1 className="motto-title">Come, Let's Screw Your World!</h1>
        <p className="description-text">
          Screws and Fasteners World has screws, bolts and repair parts. We open
          for emergencies and sometimes on holidays.
        </p>
        <div className="buttons-box">
          <Link to={productsPath} className="browse-products-button">
            See Products
          </Link>
          <Link to={aboutUsPath} className="about-us-button">
            <span className="text">Learn More</span>
            <span className="chevron">&rsaquo;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturesBox() {
  const features = featuresDict.map((x, i) => {
    return (
      <IndividualFeatureBox
        title={x.title}
        description={x.description}
        image={x.image}
        key={i}
      />
    );
  });

  return (
    <div className="FeaturesBox">
      <h2 className="title">At Screws World we don't disappoint!</h2>
      <div className="features">{features}</div>
    </div>
  );
}

function IndividualFeatureBox(props: {
  image: string;
  title: string;
  description: string;
}) {
  return (
    <div className="IndividualFeatureBox">
      <div className="image-holder">
        <img src={props.image} alt="" />
      </div>
      <h3 className="title">{props.title}</h3>
      <p className="description">{props.description}</p>
    </div>
  );
}

const featuresDict = [
  {
    title: "Awesome customer service",
    description:
      "We pride ourselves on treating our customers like royalty. Our representatives are here to cater to all your screw and fastener needs.",
    image: customerServiceIcon,
  },
  {
    title: "Great prices",
    description:
      "Our prices are fair and reasonable. We respect our customers too much to offer anything but the best prices we can.",
    image: priceIcon,
  },
  {
    title: "Wide variety of products",
    description:
      "We don’t just carry screws! We carry everything from threaded rods to fishing lines to masonry tools. Whatever you need, we got you!",
    image: toolsIcon,
  },
];

function AdditionalInfoBox() {
  return (
    <div className="AdditionalInfoBox">
      <div className="content">
        <div className="left-info-box">
          <h2 className="title">
            If you can think of it, we probably have it.
          </h2>
          <p className="description">
            For all your screw and fastener needs, we have virtually everything
            you could possibly want.
          </p>
        </div>
        <div className="right-info-box">
          <AdditionalInfoItemList>
            {[
              "Philip Screwdrivers",
              "Stainless steel bolts",
              "Screws and washers",
              "Linked Chains",
            ]}
          </AdditionalInfoItemList>
          <AdditionalInfoItemList>
            {[
              "Nuts and Bolts",
              "Threaded Rods",
              "Fishing Lines",
              "Much, much more!",
            ]}
          </AdditionalInfoItemList>
        </div>
      </div>
    </div>
  );
}

function AdditionalInfoItemList(props: { children: string[] }) {
  return (
    <ul className="List">
      {props.children.map((x, i) => {
        return (
          <li className="item" key={i}>
            {x}
          </li>
        );
      })}
    </ul>
  );
}

interface Review {
  text: string;
  author: string;
  reviewDate: string;
}

function ReviewsSection() {
  return (
    <div className="ReviewsSection">
      <div className="quotes-icon-holder">{quotesIcon}</div>
      <div className="reviews-grid-container">
        <div className="reviews-grid">
          {reviews.map((x, i) => {
            return <ReviewBox key={i} {...x} />;
          })}
        </div>
      </div>
    </div>
  );
}

function ReviewBox(props: Review) {
  return (
    <div className="Review">
      <div className="review-text">{`"${props.text}"`}</div>
      <div className="author-box">
        <div className="title">{"- " + props.author}</div>
        <div className="date">{props.reviewDate}</div>
      </div>
    </div>
  );
}

const reviews: Review[] = (() => {
  return [
    {
      text: "It's a great place to shop for just about all screws, bolts and nuts you need and more... I always recommend them.",
      author: "Alex Gardiner",
      reviewDate: "August 2019",
    },
    {
      text: "Helpful customer service. Definitely a lot of screws, nuts and bolts there in stock. Clean store.",
      author: "Rohan Deal",
      reviewDate: "April 2019",
    },
    {
      text: "Great customer service!",
      author: "Reuben Rolle",
      reviewDate: "June 2019",
    },
    {
      text: "I've found just about everything I need here... They're my go to when I need a special fastener.",
      author: "Lee McCoy",
      reviewDate: "June 2017",
    },
  ];
})();

function MapSection() {
  return (
    <div className="MapSection">
      <div className="content">
        <div className="map-holder">
          <ScrewsWorldLocationMap />
        </div>

        <div className="text-content">
          <h2 className="title">Come and pay us a visit!</h2>
          <p className="description">{`We are located on Balfour Avenue, and we open from 7:00 am to 5:00 pm on Mondays through Fridays, on most Sundays from 8:00 am to 11:00 am and sometimes on holidays.`}</p>
        </div>
      </div>
    </div>
  );
}
