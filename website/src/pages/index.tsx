import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Header, { MenuItem } from '@/components/Header';
import AuthService from '@/services/AuthService';
import Footer from '@/components/Footer';
import Card3D from '@/components/Shared/Card3D';
import dashboardImage from '@/images/landing/dashboard.png';
import formImage from '@/images/landing/form.png';
import pipelinesImage from '@/images/landing/pipelines.png';
import openSourceImage from '@/images/landing/open-source.png';
import Metadata from '@/components/Metadata';
import { SendEvent } from '@/services/AnalyticsService';

export default function Component() {
  const [primaryButton, setPrimaryButton] = useState<MenuItem>({
    label: 'Get Started',
    href: '/register',
  });
  const menuItems: MenuItem[] = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'FAQ', href: '#faq' },
  ];

  useEffect(() => {
    if (AuthService.isAuth()) {
      setPrimaryButton({ label: 'Dashboard', href: '/user/dashboard' });
    }
  }, []);

  return (
    <>
      <Metadata />
      <div className="relative scroll-smooth">
        <Header menuItems={menuItems} primaryButton={primaryButton} />

        <main className="overflow-x-hidden bg-base-100 font-body text-sm text-base-content antialiased px-4">
          <section className="py-8 lg:py-20" id="home">
            <div className="container mx-auto">
              <div className="grid gap-12 lg:grid-cols-2">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter lg:text-6xl lg:leading-none">
                    Revolutionize organizing Hackathons with
                    <br />
                    <span className="text-brandPrimaryOne">
                      Applicant
                      <span className="text-brandPrimaryTwo">Atlas</span>
                    </span>
                  </h1>
                  <p className="mt-8 text-lg">
                    Transform your event management process with our trusted
                    open source platform. Create custom forms, automate email
                    workflows, and integrate with your favorite tools to manage
                    your event seamlessly.
                  </p>
                  <div className="mt-16 inline-flex gap-3">
                    <Link href="/register">
                      <button className="btn btn-primary">Get Started</button>
                    </Link>
                    {/*<button className="btn btn-ghost">Learn More</button>*/}
                  </div>
                </div>

                <Card3D>
                  <div className="rounded-2xl bg-gradient-to-r from-indigo-200 via-red-200 to-purple-300 p-3">
                    <Image
                      alt="Dashboard Image"
                      className="rounded-lg"
                      src={dashboardImage}
                    />
                  </div>
                </Card3D>
              </div>

              {/* can add partner section later here from template */}
            </div>
          </section>

          <section className="relative py-8 lg:py-20" id="features">
            <div className="absolute start-[10%] z-0">
              <div className="pointer-events-none aspect-square w-60 rounded-full bg-gradient-to-r from-primary/10 via-violet-500/10 to-purple-500/10 blur-3xl [transform:translate3d(0,0,0)] lg:w-[600px]"></div>
            </div>

            <div className="container mx-auto">
              <div className="flex flex-col items-center">
                <h2 className="inline text-4xl font-semibold">Key Features</h2>

                <p className="mt-4 text-lg sm:text-center">
                  Explore the powerful features of ApplicantAtlas designed to
                  simplify and enhance your event management experience.
                </p>
              </div>

              <div className="relative z-[2] mt-8 grid gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-12">
                <div className="overflow-hidden rounded-lg bg-base-200 shadow-md transition-all hover:shadow-xl">
                  <Image
                    alt="Form Image"
                    className="overflow-hidden rounded-ss-lg"
                    src={formImage}
                  />
                </div>

                <div className="lg:mt-8">
                  <div className="badge badge-primary">Forms</div>
                  <h3 className="mt-2 text-3xl font-semibold">
                    Custom Form Builder
                  </h3>
                  <p className="mt-2 text-base font-medium">
                    Easily create and customize application forms to fit your
                    event&apos;s needs. Collect the information you need and
                    manage submissions seamlessly.
                  </p>

                  <ul className="mt-4 list-inside list-disc text-base">
                    <li>Advanced Response Data Validation</li>
                    <li>Time-Limited Form Access with Expiry</li>
                    <li>Simplified Response Editing</li>
                    <li>Set Submission Limits</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-12">
                <div>
                  <div className="badge badge-primary">Pipelines</div>
                  <h3 className="mt-2 text-3xl font-semibold">
                    Automated Workflows
                  </h3>
                  <p className="mt-2 text-base">
                    Streamline your event management process with our
                    intelligent automation features. Send automated emails,
                    grant time-limited form access, and trigger webhook
                    notifications. Save time and maintain consistent
                    communication with your applicants.
                  </p>

                  <ul className="mt-4 list-inside list-disc text-base">
                    <li>Automated Emails</li>
                    <li>Comphensive Triggers</li>
                    <li>Webhook Integrations</li>
                    <li>Flexible Configuration</li>
                  </ul>

                  {/*<p className="mt-2 text-base">
                    An example of one possible automated workflow with
                    ApplicantAtlas:
                  </p>
                  <ol className="mt-4 list-inside list-decimal text-base">
                    <li>Participant fills out an application.</li>
                    <li>Application is reviewed by admin.</li>
                    <li>Participant is accepted or rejected.</li>
                    <li>Participant is notified of the decision.</li>
                    <li>
                      If accepted, an email with RSVP form access is sent for 72
                      hours. If not completed within the time frame, access is
                      restricted.
                    </li>
                  </ol>*/}
                </div>

                <div className="order-first lg:order-last">
                  <div className="overflow-hidden rounded-lg bg-base-200 shadow-md transition-all hover:shadow-xl">
                    <Image
                      alt="Pipeline Image"
                      className="overflow-hidden rounded-ss-lg"
                      src={pipelinesImage}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-12">
                <div className="overflow-hidden rounded-lg bg-base-200 shadow-md transition-all hover:shadow-xl">
                  <Image
                    alt="Open Source Image"
                    className="overflow-hidden rounded-ss-lg"
                    src={openSourceImage}
                  />
                </div>

                {/* could switch to event discovery when that's added */}
                <div className="lg:mt-8">
                  <div className="badge badge-primary">Open Source</div>
                  <h3 className="mt-2 text-3xl font-semibold">
                    Open Source Flexibility
                  </h3>
                  <p className="mt-2 text-base">
                    Embrace the power of open-source with ApplicantAtlas.
                    Customize and extend the platform to fit your specific
                    needs. Join our vibrant community of developers and
                    contribute to the ongoing enhancement of the platform.
                  </p>

                  <ul className="mt-4 list-inside list-disc text-base">
                    <li>Fully Customizable</li>
                    <li>Community Driven</li>
                    <li>Transparent Development</li>
                    <li>Regular Updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 lg:py-20" id="pricing">
            <div className="container mx-auto">
              <div className="text-center">
                <h2 className="text-4xl font-semibold">Pricing Plans</h2>
                <p className="mt-2 text-lg">
                  Explore flexible pricing that scales with your needs. No
                  hidden fees, just transparent options.
                </p>
              </div>
              <div className="alert mt-4 mx-auto">
                If you&apos;re a non-profit or student focused event organizer,
                for a limited time we&apos;re offering an upgraded plan for free
                please email us for details.
              </div>
              <div className="mt-8 grid gap-8 lg:grid-cols-3">
                <div className="card border border-base-content/10 p-3 shadow-sm">
                  <div className="card bg-base-200 p-6 text-base-content">
                    <h3 className="text-xl font-semibold">Free</h3>
                    <p className="mt-2 flex items-baseline">
                      <span className="text-5xl font-bold tracking-tight">
                        $0
                      </span>
                      <span className="ml-1 text-xl font-semibold">/month</span>
                    </p>
                    <p className="mt-4">
                      Experiment with all features and functionalities with our
                      free plan.
                    </p>
                  </div>
                  <div className="p-6">
                    <ul
                      className="list-inside list-disc space-y-3 text-base-content"
                      role="list"
                    >
                      <li>
                        <span className="ms-3">1 Event</span>
                      </li>
                      <li>
                        <span className="ms-3">
                          50 Responses<small>/mo</small>
                        </span>
                      </li>
                      <li>
                        <span className="ms-3">
                          50 Pipeline Runs<small>/mo</small>
                        </span>
                      </li>
                    </ul>
                  </div>
                  <Link href="/register" className="mt-auto">
                    <button
                      className="btn btn-outline btn-block "
                      onClick={() => {
                        SendEvent('pricingInterest', {
                          action: 'click',
                          label: 'upgrade_free',
                        });
                      }}
                    >
                      Start for Free
                    </button>
                  </Link>
                </div>
                <div className="card border border-base-content/10 bg-base-100 p-3 shadow-sm">
                  <div className="card bg-base-200 p-6 text-base-content">
                    <div className="flex justify-between">
                      <h3 className="text-xl font-semibold text-primary">
                        Premium
                      </h3>
                      <div className="badge badge-outline text-sm font-medium">
                        Best Offer
                      </div>
                    </div>

                    <p className="mt-4 flex items-baseline">
                      <span
                        className="text-5xl font-bold tracking-tight text-primary"
                        x-text="premium[period]"
                      >
                        {' '}
                        $12
                      </span>
                      <span className="ml-1 text-xl font-semibold">/month</span>
                    </p>
                    <p className="mt-6">
                      Increase your event management capabilities with our
                      premium plan that offers more events, responses, and
                      pipeline runs.
                    </p>
                  </div>
                  <div className="p-6">
                    <ul
                      className="list-inside list-disc space-y-3 text-base-content"
                      role="list"
                    >
                      <li>
                        <span className="ms-3">3 Events</span>
                      </li>
                      <li>
                        <span className="ms-3">
                          1000 Responses<small>/mo</small>
                        </span>
                      </li>
                      <li>
                        <span className="ms-3">
                          1000 Pipeline Runs<small>/mo</small>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <button
                    className="btn btn-primary btn-block mt-auto"
                    onClick={() => {
                      SendEvent('pricingInterest', {
                        action: 'click',
                        label: 'upgrade_premium',
                      });
                      alert(
                        'This plan is not yet available. Please email hello@applicantatlas.com for more information.',
                      );
                    }}
                  >
                    Upgrade to Premium
                  </button>
                </div>
                <div className="card border border-base-content/10 p-3 shadow-sm">
                  <div className="card bg-base-200 p-6">
                    <h3 className="text-xl font-semibold">Ultimate</h3>
                    <p className="mt-4 flex items-baseline">
                      <span
                        className="text-5xl font-bold tracking-tight"
                        x-text="ultimate[period]"
                      ></span>
                      <span className="ml-1 text-xl font-semibold"></span>
                    </p>
                    <p className="mt-6">
                      Unleash the ultimate potential of event management with
                      our custom plan tailored to your needs.
                    </p>
                  </div>
                  <div className="p-6">
                    <ul
                      className="list-inside list-disc space-y-3 text-base-content"
                      role="list"
                    >
                      <li>
                        <span className="ms-3">Unlimited Events</span>
                      </li>
                      <li>
                        <span className="ms-3">
                          Custom Responses<small>/mo</small>
                        </span>
                      </li>
                      <li>
                        <span className="ms-3">
                          Custom Pipeline Runs<small>/mo</small>
                        </span>
                      </li>
                    </ul>
                  </div>
                  <a href="mailto:hello@applicantatlas.com" className="mt-auto">
                    <button
                      className="btn btn-outline btn-secondary btn-block mt-auto"
                      onClick={() => {
                        SendEvent('pricingInterest', {
                          action: 'click',
                          label: 'contact_ultimate',
                        });
                        alert(
                          'Please email hello@applicantatlas.com for custom pricing',
                        );
                      }}
                    >
                      Contact for Custom Pricing
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 lg:py-20" id="about">
            <div className="container mx-auto">
              <div className="text-center">
                <h2 className="text-4xl font-semibold">About Us</h2>
                <p className="mt-2 text-lg">
                  Discover our journey and what drives us to innovate in the
                  event management space.
                </p>
              </div>

              <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div>
                  <h3 className="text-3xl font-semibold">My Story</h3>
                  <p className="mt-4 text-base">
                    ApplicantAtlas began as a personal project driven by
                    necessity. As the founder, I was involved in organizing a
                    hackathon called{' '}
                    <Link
                      href="https://www.madhacks.io/"
                      className="font-medium hover:font-semibold"
                    >
                      MadHacks
                    </Link>
                    . The process of managing application forms and automating
                    tasks like form access verification was cumbersome.
                    Initially, I aimed to create a simple script to handle these
                    tasks, but the project quickly expanded in scope.
                  </p>
                  <p className="mt-4 text-base">
                    Realizing the potential for a comprehensive solution, I
                    dedicated myself to developing ApplicantAtlas into a
                    full-fledged platform. Today, it stands as a robust,
                    open-source event management tool that empowers organizers
                    with automation, customization, and seamless integration
                    capabilities.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2">
                  <Image
                    alt="Main Contributor"
                    className="rounded-full w-48 h-48"
                    src="https://avatars.githubusercontent.com/u/34144122?v=4"
                    width={512}
                    height={512}
                  />
                  <div className="text-center">
                    <p className="text-lg font-semibold">David Teather</p>
                    <p className="text-sm text-gray-600">Lead Contributor</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-12">
                <div className="card border border-base-content/10 p-6 transition-all hover:shadow">
                  <h4 className="text-2xl font-semibold">Our Mission</h4>
                  <p className="mt-4 text-base">
                    To provide a flexible, powerful, and user-friendly platform
                    that helps event organizers streamline their processes and
                    deliver exceptional experiences.
                  </p>
                </div>

                <div className="card border border-base-content/10 p-6 transition-all hover:shadow">
                  <h4 className="text-2xl font-semibold">Our Vision</h4>
                  <p className="mt-4 text-base">
                    To become the go-to event management platform for organizers
                    worldwide, fostering innovation and collaboration in the
                    event space.
                  </p>
                </div>

                <div className="card border border-base-content/10 p-6 transition-all hover:shadow">
                  <h4 className="text-2xl font-semibold">Our Values</h4>
                  <ul className="mt-4 list-inside list-disc text-base">
                    <li>Community</li>
                    <li>Innovation</li>
                    <li>Transparency</li>
                    <li>Empowerment</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 lg:py-20" id="faq">
            <div className="container mx-auto">
              <div className="text-center">
                <h2 className="text-4xl font-semibold text-base-content">
                  FAQs
                </h2>
                <p className="mt-2 text-lg">
                  Find answers to some of the most common questions about the
                  ApplicantAtlas platform.
                </p>
              </div>

              <div className="mt-12 flex justify-center gap-6">
                <div className="space-y-4 lg:w-1/2">
                  <div className="collapse collapse-arrow border border-base-content/10">
                    <input
                      name="faq_what_is_applicant_atlas"
                      type="radio"
                      id="faq_what_is_applicant_atlas"
                      aria-labelledby="faq_what_is_applicant_atlas_label"
                      aria-label="What is ApplicantAtlas?"
                    />
                    <label
                      className="collapse-title text-xl font-medium"
                      id="faq_what_is_applicant_atlas_label"
                      htmlFor="faq_what_is_applicant_atlas"
                    >
                      What is ApplicantAtlas?
                    </label>
                    <div className="collapse-content">
                      <p className="text-base">
                        ApplicantAtlas is an open-source event management
                        platform designed to streamline the process of
                        organizing events, especially hackathons. It offers
                        tools for creating custom forms, automating workflows,
                        and integrating with other applications.
                      </p>
                    </div>
                  </div>
                  <div className="collapse collapse-arrow border border-base-content/10">
                    <input
                      name="faq_getting_started"
                      type="radio"
                      id="faq_getting_started"
                      aria-labelledby="faq_getting_started_label"
                      aria-label="How can I get started with ApplicantAtlas?"
                    />
                    <label
                      className="collapse-title text-xl font-medium"
                      id="faq_getting_started_label"
                      htmlFor="faq_getting_started"
                    >
                      How can I get started with ApplicantAtlas?
                    </label>
                    <div className="collapse-content">
                      <p className="text-base">
                        You&apos;ll need to run your own instance of
                        ApplicantAtlas to get the full experience. You can find
                        the source code and documentation on running your own
                        instance{' '}
                        <Link
                          href="https://github.com/ApplicantAtlas/ApplicantAtlas/blob/main/website/docs/index.md"
                          className="font-medium hover:font-semibold"
                        >
                          here
                        </Link>
                        .
                        <br />
                        We&apos;re currently working behind the scenes to offer
                        a fully managed hosted version of ApplicantAtlas soon!
                        This way you won&apos;t need to worry about hosting your
                        own instance.
                      </p>
                    </div>
                  </div>
                  <div className="collapse collapse-arrow border border-base-content/10">
                    <input
                      name="faq_open_source"
                      type="radio"
                      id="faq_open_source"
                      aria-labelledby="faq_open_source_label"
                      aria-label="Is ApplicantAtlas really open-source?"
                    />
                    <label
                      className="collapse-title text-xl font-medium"
                      id="faq_open_source_label"
                      htmlFor="faq_open_source"
                    >
                      Is ApplicantAtlas really open-source?
                    </label>
                    <div className="collapse-content">
                      <p className="text-base">
                        Yes, ApplicantAtlas is fully open-source under the AGPL
                        license. You can access the source code, customize it to
                        fit your needs, and contribute back to the community by
                        sharing improvements and feedback. You can access the
                        code on{' '}
                        <Link
                          href="https://github.com/ApplicantAtlas/ApplicantAtlas"
                          className="font-medium hover:font-semibold"
                        >
                          GitHub
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                  <div className="collapse collapse-arrow border border-base-content/10">
                    <input
                      name="faq_integrations"
                      type="radio"
                      id="faq_integrations"
                      aria-labelledby="faq_integrations_label"
                      aria-label="What integrations are available with ApplicantAtlas?"
                    />
                    <label
                      className="collapse-title text-xl font-medium"
                      id="faq_integrations_label"
                      htmlFor="faq_integrations"
                    >
                      What integrations are available with ApplicantAtlas?
                    </label>
                    <div className="collapse-content">
                      <p className="text-base">
                        Currently, we offer integrations via webhooks. You can
                        configure webhooks to trigger events in other
                        applications based on actions in ApplicantAtlas.
                        We&apos;re working on adding more application-specific
                        integrations in the future.
                      </p>
                    </div>
                  </div>
                  <div className="collapse collapse-arrow border border-base-content/10">
                    <input
                      name="faq_contribute"
                      type="radio"
                      id="faq_contribute"
                      aria-labelledby="faq_contribute_label"
                      aria-label="How can I contribute to ApplicantAtlas?"
                    />
                    <label
                      className="collapse-title text-xl font-medium"
                      id="faq_contribute_label"
                      htmlFor="faq_contribute"
                    >
                      How can I contribute to ApplicantAtlas?
                    </label>
                    <div className="collapse-content">
                      <p className="text-base">
                        We welcome contributions of any type to ApplicantAtlas,
                        whether it&apos;s code, documentation, better designs,
                        or anything else! The best place to find up-to-date
                        information on contributing is{' '}
                        <Link
                          href="https://github.com/ApplicantAtlas/ApplicantAtlas/blob/main/website/docs/developers/index.md#contributing"
                          className="font-medium hover:font-semibold"
                        >
                          here
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                  <div className="collapse collapse-arrow border border-base-content/10">
                    <input
                      name="faq_more_info"
                      type="radio"
                      id="faq_more_info"
                      aria-labelledby="faq_more_info_label"
                      aria-label="Where can I access more information about ApplicantAtlas?"
                    />
                    <label
                      className="collapse-title text-xl font-medium"
                      id="faq_more_info_label"
                      htmlFor="faq_more_info"
                    >
                      Where can I access more information about ApplicantAtlas?
                    </label>
                    <div className="collapse-content">
                      <p className="text-base">
                        The best place to find more information is on our{' '}
                        <Link
                          href="https://github.com/ApplicantAtlas/ApplicantAtlas"
                          className="font-medium hover:font-semibold"
                        >
                          GitHub
                        </Link>{' '}
                        page. Links to the documentation are linked on the
                        project&apos;s readme.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
