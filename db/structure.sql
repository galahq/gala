SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


SET search_path = public, pg_catalog;

--
-- Name: jsonb_path_to_tsvector(jsonb, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION jsonb_path_to_tsvector(jsondata jsonb, path_elems text[], OUT tsv tsvector) RETURNS tsvector
    LANGUAGE plpgsql IMMUTABLE
    AS $$
  BEGIN
    SELECT INTO tsv
      coalesce(
        tsvector_agg(to_tsvector(data #>> path_elems)),
        to_tsvector('')
      )
    FROM jsonb_array_elements(jsondata) AS data;
    RETURN;
  END;
$$;


--
-- Name: tsvector_agg(tsvector); Type: AGGREGATE; Schema: public; Owner: -
--

CREATE AGGREGATE tsvector_agg(tsvector) (
    SFUNC = tsvector_concat,
    STYPE = tsvector
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: active_storage_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE active_storage_attachments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    blob_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE active_storage_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE active_storage_attachments_id_seq OWNED BY active_storage_attachments.id;


--
-- Name: active_storage_blobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE active_storage_blobs (
    id bigint NOT NULL,
    key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying,
    metadata text,
    byte_size bigint NOT NULL,
    checksum character varying NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE active_storage_blobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE active_storage_blobs_id_seq OWNED BY active_storage_blobs.id;


--
-- Name: ahoy_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ahoy_events (
    id integer NOT NULL,
    visit_id integer,
    user_id integer,
    name character varying,
    properties jsonb,
    "time" timestamp without time zone
);


--
-- Name: ahoy_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE ahoy_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ahoy_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE ahoy_events_id_seq OWNED BY ahoy_events.id;


--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE answers (
    id integer NOT NULL,
    question_id integer,
    quiz_id integer,
    reader_id integer,
    content character varying,
    correct boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    case_completion numeric,
    submission_id bigint
);


--
-- Name: answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE answers_id_seq OWNED BY answers.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: authentication_strategies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE authentication_strategies (
    id integer NOT NULL,
    provider character varying,
    uid character varying,
    reader_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: authentication_strategies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE authentication_strategies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: authentication_strategies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE authentication_strategies_id_seq OWNED BY authentication_strategies.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cards (
    id integer NOT NULL,
    "position" integer,
    page_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    solid boolean DEFAULT true,
    element_type character varying,
    element_id integer,
    case_id integer,
    raw_content jsonb DEFAULT '""'::jsonb
);


--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE cards_id_seq OWNED BY cards.id;


--
-- Name: case_elements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE case_elements (
    id integer NOT NULL,
    case_id integer,
    element_type character varying,
    element_id integer,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: case_elements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE case_elements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: case_elements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE case_elements_id_seq OWNED BY case_elements.id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE cases (
    id integer NOT NULL,
    slug text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    photo_credit text,
    commentable boolean,
    published_at timestamp without time zone,
    featured_at timestamp without time zone,
    latitude double precision,
    longitude double precision,
    zoom double precision,
    library_id bigint,
    locale text NOT NULL,
    translation_base_id bigint,
    acknowledgements text DEFAULT ''::text,
    audience text DEFAULT ''::text,
    authors jsonb DEFAULT '""'::jsonb,
    classroom_timeline text DEFAULT ''::text,
    dek text DEFAULT ''::text,
    kicker text DEFAULT ''::text,
    learning_objectives jsonb DEFAULT '""'::jsonb,
    summary text DEFAULT ''::text,
    title text DEFAULT ''::text,
    translators jsonb DEFAULT '""'::jsonb
);


--
-- Name: cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE cases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE cases_id_seq OWNED BY cases.id;


--
-- Name: comment_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE comment_threads (
    id integer NOT NULL,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    original_highlight_text character varying,
    locale character varying,
    card_id integer,
    reader_id integer,
    forum_id integer,
    comments_count integer
);


--
-- Name: comment_threads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE comment_threads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE comment_threads_id_seq OWNED BY comment_threads.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE comments (
    id integer NOT NULL,
    reader_id integer,
    comment_thread_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "position" integer,
    content jsonb DEFAULT '""'::jsonb
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE comments_id_seq OWNED BY comments.id;


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE communities (
    id integer NOT NULL,
    name jsonb,
    group_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description jsonb DEFAULT '""'::jsonb,
    universal boolean DEFAULT false
);


--
-- Name: communities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE communities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE communities_id_seq OWNED BY communities.id;


--
-- Name: deployments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE deployments (
    id integer NOT NULL,
    case_id integer,
    group_id integer,
    quiz_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    answers_needed integer DEFAULT 1,
    key character varying
);


--
-- Name: deployments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE deployments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deployments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE deployments_id_seq OWNED BY deployments.id;


--
-- Name: edgenotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE edgenotes (
    id integer NOT NULL,
    format character varying,
    thumbnail_url character varying,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    slug text NOT NULL,
    card_id integer,
    style integer DEFAULT 0,
    alt_text character varying,
    highlighted boolean DEFAULT false,
    attribution text DEFAULT ''::text,
    audio_url text DEFAULT ''::text,
    call_to_action text DEFAULT ''::text,
    caption text DEFAULT ''::text,
    content text DEFAULT ''::text,
    embed_code text DEFAULT ''::text,
    image_url text DEFAULT ''::text,
    instructions text DEFAULT ''::text,
    pdf_url text DEFAULT ''::text,
    photo_credit text DEFAULT ''::text,
    pull_quote text DEFAULT ''::text,
    website_url text DEFAULT ''::text,
    icon_slug text
);


--
-- Name: edgenotes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE edgenotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: edgenotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE edgenotes_id_seq OWNED BY edgenotes.id;


--
-- Name: editorships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE editorships (
    id bigint NOT NULL,
    case_id bigint,
    editor_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: editorships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE editorships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: editorships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE editorships_id_seq OWNED BY editorships.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE enrollments (
    id integer NOT NULL,
    reader_id integer,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status integer DEFAULT 0,
    active_group_id integer
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE enrollments_id_seq OWNED BY enrollments.id;


--
-- Name: forums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE forums (
    id integer NOT NULL,
    case_id integer,
    community_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: forums_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE forums_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE forums_id_seq OWNED BY forums.id;


--
-- Name: friendly_id_slugs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE friendly_id_slugs (
    id bigint NOT NULL,
    slug character varying NOT NULL,
    sluggable_id integer NOT NULL,
    sluggable_type character varying(50),
    scope character varying,
    created_at timestamp without time zone
);


--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE friendly_id_slugs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: friendly_id_slugs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE friendly_id_slugs_id_seq OWNED BY friendly_id_slugs.id;


--
-- Name: group_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE group_memberships (
    id integer NOT NULL,
    reader_id integer,
    group_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status integer DEFAULT 0 NOT NULL
);


--
-- Name: group_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE group_memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE group_memberships_id_seq OWNED BY group_memberships.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE groups (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    context_id character varying,
    name jsonb DEFAULT '""'::jsonb
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE groups_id_seq OWNED BY groups.id;


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE invitations (
    id integer NOT NULL,
    reader_id integer,
    community_id integer,
    inviter_id integer,
    accepted_at timestamp without time zone,
    rescinded_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE invitations_id_seq OWNED BY invitations.id;


--
-- Name: libraries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE libraries (
    id bigint NOT NULL,
    slug character varying,
    logo_url character varying,
    background_color character varying,
    foreground_color character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description jsonb,
    url jsonb,
    name jsonb,
    cases_count integer DEFAULT 0,
    visible_in_catalog_at timestamp without time zone
);


--
-- Name: libraries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE libraries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libraries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE libraries_id_seq OWNED BY libraries.id;


--
-- Name: link_expansion_visibilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE link_expansion_visibilities (
    id bigint NOT NULL,
    no_description boolean DEFAULT false,
    no_embed boolean DEFAULT false,
    no_image boolean DEFAULT false,
    edgenote_id bigint
);


--
-- Name: link_expansion_visibilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE link_expansion_visibilities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: link_expansion_visibilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE link_expansion_visibilities_id_seq OWNED BY link_expansion_visibilities.id;


--
-- Name: locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE locks (
    id bigint NOT NULL,
    lockable_type character varying,
    lockable_id bigint,
    reader_id bigint,
    case_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: locks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE locks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE locks_id_seq OWNED BY locks.id;


--
-- Name: managerships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE managerships (
    id bigint NOT NULL,
    library_id bigint,
    manager_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: managerships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE managerships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: managerships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE managerships_id_seq OWNED BY managerships.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE pages (
    id integer NOT NULL,
    "position" integer,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    title text DEFAULT ''::text,
    icon_slug text
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE pages_id_seq OWNED BY pages.id;


--
-- Name: podcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE podcasts (
    id integer NOT NULL,
    case_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "position" integer,
    artwork_url character varying,
    photo_credit text,
    audio_url text DEFAULT ''::text,
    credits text DEFAULT ''::text,
    title text DEFAULT ''::text
);


--
-- Name: podcasts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE podcasts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: podcasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE podcasts_id_seq OWNED BY podcasts.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE questions (
    id integer NOT NULL,
    quiz_id integer,
    correct_answer text,
    options character varying[] DEFAULT '{}'::character varying[],
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    content jsonb DEFAULT '""'::jsonb
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE questions_id_seq OWNED BY questions.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE quizzes (
    id integer NOT NULL,
    case_id integer,
    template_id integer,
    customized boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    author_id integer,
    lti_uid character varying
);


--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE quizzes_id_seq OWNED BY quizzes.id;


--
-- Name: readers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE readers (
    id integer NOT NULL,
    name text,
    image_url text,
    email character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying,
    reset_password_token character varying,
    reset_password_sent_at timestamp without time zone,
    remember_created_at timestamp without time zone,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip inet,
    last_sign_in_ip inet,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    initials text,
    locale text,
    confirmation_token character varying,
    confirmed_at timestamp without time zone,
    confirmation_sent_at timestamp without time zone,
    unconfirmed_email character varying,
    created_password boolean DEFAULT true,
    send_reply_notifications boolean DEFAULT true,
    active_community_id integer
);


--
-- Name: readers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE readers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: readers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE readers_id_seq OWNED BY readers.id;


--
-- Name: readers_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE readers_roles (
    reader_id integer,
    role_id integer
);


--
-- Name: reply_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE reply_notifications (
    id integer NOT NULL,
    reader_id integer,
    notifier_id integer,
    comment_id integer,
    comment_thread_id integer,
    case_id integer,
    page_id integer,
    card_id integer
);


--
-- Name: reply_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE reply_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reply_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE reply_notifications_id_seq OWNED BY reply_notifications.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE roles (
    id integer NOT NULL,
    name character varying,
    resource_type character varying,
    resource_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE roles_id_seq OWNED BY roles.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE schema_migrations (
    version character varying NOT NULL
);


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE submissions (
    id bigint NOT NULL,
    quiz_id bigint,
    reader_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE submissions_id_seq OWNED BY submissions.id;


--
-- Name: taggings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE taggings (
    id bigint NOT NULL,
    case_id bigint,
    tag_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: taggings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE taggings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: taggings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE taggings_id_seq OWNED BY taggings.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tags (
    id bigint NOT NULL,
    category boolean DEFAULT false NOT NULL,
    name character varying NOT NULL,
    display_name jsonb,
    taggings_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tags_id_seq OWNED BY tags.id;


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE visits (
    id integer NOT NULL,
    visit_token character varying,
    visitor_token character varying,
    ip character varying,
    user_agent text,
    referrer text,
    landing_page text,
    user_id integer,
    referring_domain character varying,
    search_keyword character varying,
    browser character varying,
    os character varying,
    device_type character varying,
    screen_height integer,
    screen_width integer,
    country character varying,
    region character varying,
    city character varying,
    postal_code character varying,
    latitude numeric,
    longitude numeric,
    utm_source character varying,
    utm_medium character varying,
    utm_term character varying,
    utm_content character varying,
    utm_campaign character varying,
    started_at timestamp without time zone
);


--
-- Name: visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE visits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE visits_id_seq OWNED BY visits.id;


--
-- Name: active_storage_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY active_storage_attachments ALTER COLUMN id SET DEFAULT nextval('active_storage_attachments_id_seq'::regclass);


--
-- Name: active_storage_blobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY active_storage_blobs ALTER COLUMN id SET DEFAULT nextval('active_storage_blobs_id_seq'::regclass);


--
-- Name: ahoy_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY ahoy_events ALTER COLUMN id SET DEFAULT nextval('ahoy_events_id_seq'::regclass);


--
-- Name: answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY answers ALTER COLUMN id SET DEFAULT nextval('answers_id_seq'::regclass);


--
-- Name: authentication_strategies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY authentication_strategies ALTER COLUMN id SET DEFAULT nextval('authentication_strategies_id_seq'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cards ALTER COLUMN id SET DEFAULT nextval('cards_id_seq'::regclass);


--
-- Name: case_elements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY case_elements ALTER COLUMN id SET DEFAULT nextval('case_elements_id_seq'::regclass);


--
-- Name: cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases ALTER COLUMN id SET DEFAULT nextval('cases_id_seq'::regclass);


--
-- Name: comment_threads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY comment_threads ALTER COLUMN id SET DEFAULT nextval('comment_threads_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments ALTER COLUMN id SET DEFAULT nextval('comments_id_seq'::regclass);


--
-- Name: communities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY communities ALTER COLUMN id SET DEFAULT nextval('communities_id_seq'::regclass);


--
-- Name: deployments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY deployments ALTER COLUMN id SET DEFAULT nextval('deployments_id_seq'::regclass);


--
-- Name: edgenotes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY edgenotes ALTER COLUMN id SET DEFAULT nextval('edgenotes_id_seq'::regclass);


--
-- Name: editorships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY editorships ALTER COLUMN id SET DEFAULT nextval('editorships_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY enrollments ALTER COLUMN id SET DEFAULT nextval('enrollments_id_seq'::regclass);


--
-- Name: forums id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY forums ALTER COLUMN id SET DEFAULT nextval('forums_id_seq'::regclass);


--
-- Name: friendly_id_slugs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY friendly_id_slugs ALTER COLUMN id SET DEFAULT nextval('friendly_id_slugs_id_seq'::regclass);


--
-- Name: group_memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY group_memberships ALTER COLUMN id SET DEFAULT nextval('group_memberships_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY groups ALTER COLUMN id SET DEFAULT nextval('groups_id_seq'::regclass);


--
-- Name: invitations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY invitations ALTER COLUMN id SET DEFAULT nextval('invitations_id_seq'::regclass);


--
-- Name: libraries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries ALTER COLUMN id SET DEFAULT nextval('libraries_id_seq'::regclass);


--
-- Name: link_expansion_visibilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY link_expansion_visibilities ALTER COLUMN id SET DEFAULT nextval('link_expansion_visibilities_id_seq'::regclass);


--
-- Name: locks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY locks ALTER COLUMN id SET DEFAULT nextval('locks_id_seq'::regclass);


--
-- Name: managerships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY managerships ALTER COLUMN id SET DEFAULT nextval('managerships_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY pages ALTER COLUMN id SET DEFAULT nextval('pages_id_seq'::regclass);


--
-- Name: podcasts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY podcasts ALTER COLUMN id SET DEFAULT nextval('podcasts_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions ALTER COLUMN id SET DEFAULT nextval('questions_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY quizzes ALTER COLUMN id SET DEFAULT nextval('quizzes_id_seq'::regclass);


--
-- Name: readers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY readers ALTER COLUMN id SET DEFAULT nextval('readers_id_seq'::regclass);


--
-- Name: reply_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reply_notifications ALTER COLUMN id SET DEFAULT nextval('reply_notifications_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY roles ALTER COLUMN id SET DEFAULT nextval('roles_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY submissions ALTER COLUMN id SET DEFAULT nextval('submissions_id_seq'::regclass);


--
-- Name: taggings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY taggings ALTER COLUMN id SET DEFAULT nextval('taggings_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags ALTER COLUMN id SET DEFAULT nextval('tags_id_seq'::regclass);


--
-- Name: visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY visits ALTER COLUMN id SET DEFAULT nextval('visits_id_seq'::regclass);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: cases_search_index; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW cases_search_index AS
 SELECT cases.id,
    (((((((((setweight(to_tsvector(COALESCE(cases.kicker, ''::text)), 'A'::"char") || setweight(to_tsvector(COALESCE(cases.title, ''::text)), 'A'::"char")) || setweight(to_tsvector(COALESCE(cases.dek, ''::text)), 'A'::"char")) || setweight(to_tsvector(COALESCE(cases.summary, ''::text)), 'A'::"char")) || setweight(jsonb_path_to_tsvector(
        CASE
            WHEN (jsonb_typeof(cases.learning_objectives) <> 'array'::text) THEN '[]'::jsonb
            ELSE cases.learning_objectives
        END, '{}'::text[]), 'B'::"char")) || jsonb_path_to_tsvector(cases.authors, '{name}'::text[])) || setweight(to_tsvector(COALESCE(string_agg(pages.title, ' '::text), ''::text)), 'B'::"char")) || setweight(to_tsvector(COALESCE(string_agg(podcasts.title, ' '::text), ''::text)), 'B'::"char")) || to_tsvector(COALESCE(string_agg(podcasts.credits, ' '::text), ''::text))) || COALESCE(tsvector_agg(jsonb_path_to_tsvector((cards.raw_content -> 'blocks'::text), '{text}'::text[])), to_tsvector(''::text))) AS document
   FROM (((cases
     LEFT JOIN pages ON ((pages.case_id = cases.id)))
     LEFT JOIN podcasts ON ((podcasts.case_id = cases.id)))
     LEFT JOIN cards ON ((cards.case_id = cases.id)))
  GROUP BY cases.id
  WITH NO DATA;


--
-- Name: active_storage_attachments active_storage_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY active_storage_attachments
    ADD CONSTRAINT active_storage_attachments_pkey PRIMARY KEY (id);


--
-- Name: active_storage_blobs active_storage_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY active_storage_blobs
    ADD CONSTRAINT active_storage_blobs_pkey PRIMARY KEY (id);


--
-- Name: ahoy_events ahoy_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ahoy_events
    ADD CONSTRAINT ahoy_events_pkey PRIMARY KEY (id);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: authentication_strategies authentication_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY authentication_strategies
    ADD CONSTRAINT authentication_strategies_pkey PRIMARY KEY (id);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: case_elements case_elements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY case_elements
    ADD CONSTRAINT case_elements_pkey PRIMARY KEY (id);


--
-- Name: comment_threads comment_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comment_threads
    ADD CONSTRAINT comment_threads_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: deployments deployments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY deployments
    ADD CONSTRAINT deployments_pkey PRIMARY KEY (id);


--
-- Name: edgenotes edgenotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY edgenotes
    ADD CONSTRAINT edgenotes_pkey PRIMARY KEY (id);


--
-- Name: editorships editorships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY editorships
    ADD CONSTRAINT editorships_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: forums forums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY forums
    ADD CONSTRAINT forums_pkey PRIMARY KEY (id);


--
-- Name: friendly_id_slugs friendly_id_slugs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY friendly_id_slugs
    ADD CONSTRAINT friendly_id_slugs_pkey PRIMARY KEY (id);


--
-- Name: group_memberships group_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY group_memberships
    ADD CONSTRAINT group_memberships_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: libraries libraries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries
    ADD CONSTRAINT libraries_pkey PRIMARY KEY (id);


--
-- Name: link_expansion_visibilities link_expansion_visibilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY link_expansion_visibilities
    ADD CONSTRAINT link_expansion_visibilities_pkey PRIMARY KEY (id);


--
-- Name: locks locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY locks
    ADD CONSTRAINT locks_pkey PRIMARY KEY (id);


--
-- Name: managerships managerships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY managerships
    ADD CONSTRAINT managerships_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: podcasts podcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY podcasts
    ADD CONSTRAINT podcasts_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: readers readers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY readers
    ADD CONSTRAINT readers_pkey PRIMARY KEY (id);


--
-- Name: reply_notifications reply_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reply_notifications
    ADD CONSTRAINT reply_notifications_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: taggings taggings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY taggings
    ADD CONSTRAINT taggings_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: index_active_storage_attachments_on_blob_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_active_storage_attachments_on_blob_id ON active_storage_attachments USING btree (blob_id);


--
-- Name: index_active_storage_attachments_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_attachments_uniqueness ON active_storage_attachments USING btree (record_type, record_id, name, blob_id);


--
-- Name: index_active_storage_blobs_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_blobs_on_key ON active_storage_blobs USING btree (key);


--
-- Name: index_ahoy_events_on_name_and_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_name_and_time ON ahoy_events USING btree (name, "time");


--
-- Name: index_ahoy_events_on_properties_jsonb_path_ops; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_properties_jsonb_path_ops ON ahoy_events USING gin (properties jsonb_path_ops);


--
-- Name: index_ahoy_events_on_user_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_user_id_and_name ON ahoy_events USING btree (user_id, name);


--
-- Name: index_ahoy_events_on_visit_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ahoy_events_on_visit_id_and_name ON ahoy_events USING btree (visit_id, name);


--
-- Name: index_answers_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_question_id ON answers USING btree (question_id);


--
-- Name: index_answers_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_quiz_id ON answers USING btree (quiz_id);


--
-- Name: index_answers_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_reader_id ON answers USING btree (reader_id);


--
-- Name: index_answers_on_submission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_answers_on_submission_id ON answers USING btree (submission_id);


--
-- Name: index_authentication_strategies_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_authentication_strategies_on_reader_id ON authentication_strategies USING btree (reader_id);


--
-- Name: index_authentication_strategies_on_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_authentication_strategies_on_uid ON authentication_strategies USING btree (uid) WHERE ((provider)::text = 'lti'::text);


--
-- Name: index_cards_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cards_on_case_id ON cards USING btree (case_id);


--
-- Name: index_cards_on_element_type_and_element_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cards_on_element_type_and_element_id ON cards USING btree (element_type, element_id);


--
-- Name: index_cards_on_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cards_on_page_id ON cards USING btree (page_id);


--
-- Name: index_case_elements_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_elements_on_case_id ON case_elements USING btree (case_id);


--
-- Name: index_case_elements_on_element_type_and_element_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_case_elements_on_element_type_and_element_id ON case_elements USING btree (element_type, element_id);


--
-- Name: index_cases_on_full_text; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cases_on_full_text ON cases_search_index USING gin (document);


--
-- Name: index_cases_on_library_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cases_on_library_id ON cases USING btree (library_id);


--
-- Name: index_cases_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_cases_on_slug ON cases USING btree (slug);


--
-- Name: index_cases_on_translation_base_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_cases_on_translation_base_id ON cases USING btree (translation_base_id);


--
-- Name: index_cases_search_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_cases_search_index ON cases_search_index USING btree (id);


--
-- Name: index_comment_threads_on_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_card_id ON comment_threads USING btree (card_id);


--
-- Name: index_comment_threads_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_case_id ON comment_threads USING btree (case_id);


--
-- Name: index_comment_threads_on_forum_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_forum_id ON comment_threads USING btree (forum_id);


--
-- Name: index_comment_threads_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comment_threads_on_reader_id ON comment_threads USING btree (reader_id);


--
-- Name: index_comments_on_comment_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_comment_thread_id ON comments USING btree (comment_thread_id);


--
-- Name: index_comments_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_reader_id ON comments USING btree (reader_id);


--
-- Name: index_communities_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communities_on_group_id ON communities USING btree (group_id);


--
-- Name: index_communities_on_universal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communities_on_universal ON communities USING btree (universal);


--
-- Name: index_deployments_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_deployments_on_case_id ON deployments USING btree (case_id);


--
-- Name: index_deployments_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_deployments_on_group_id ON deployments USING btree (group_id);


--
-- Name: index_deployments_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_deployments_on_key ON deployments USING btree (key);


--
-- Name: index_deployments_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_deployments_on_quiz_id ON deployments USING btree (quiz_id);


--
-- Name: index_edgenotes_on_card_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edgenotes_on_card_id ON edgenotes USING btree (card_id);


--
-- Name: index_edgenotes_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_edgenotes_on_case_id ON edgenotes USING btree (case_id);


--
-- Name: index_edgenotes_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_edgenotes_on_slug ON edgenotes USING btree (slug);


--
-- Name: index_editorships_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_editorships_on_case_id ON editorships USING btree (case_id);


--
-- Name: index_editorships_on_editor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_editorships_on_editor_id ON editorships USING btree (editor_id);


--
-- Name: index_enrollments_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_enrollments_on_case_id ON enrollments USING btree (case_id);


--
-- Name: index_enrollments_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_enrollments_on_reader_id ON enrollments USING btree (reader_id);


--
-- Name: index_forums_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_forums_on_case_id ON forums USING btree (case_id);


--
-- Name: index_forums_on_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_forums_on_community_id ON forums USING btree (community_id);


--
-- Name: index_friendly_id_slugs_on_slug_and_sluggable_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_friendly_id_slugs_on_slug_and_sluggable_type ON friendly_id_slugs USING btree (slug, sluggable_type);


--
-- Name: index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope ON friendly_id_slugs USING btree (slug, sluggable_type, scope);


--
-- Name: index_friendly_id_slugs_on_sluggable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_friendly_id_slugs_on_sluggable_id ON friendly_id_slugs USING btree (sluggable_id);


--
-- Name: index_friendly_id_slugs_on_sluggable_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_friendly_id_slugs_on_sluggable_type ON friendly_id_slugs USING btree (sluggable_type);


--
-- Name: index_group_memberships_on_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_group_memberships_on_group_id ON group_memberships USING btree (group_id);


--
-- Name: index_group_memberships_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_group_memberships_on_reader_id ON group_memberships USING btree (reader_id);


--
-- Name: index_groups_on_context_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_groups_on_context_id ON groups USING btree (context_id);


--
-- Name: index_invitations_on_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invitations_on_community_id ON invitations USING btree (community_id);


--
-- Name: index_invitations_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_invitations_on_reader_id ON invitations USING btree (reader_id);


--
-- Name: index_libraries_on_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_libraries_on_slug ON libraries USING btree (slug);


--
-- Name: index_libraries_on_visible_in_catalog_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_visible_in_catalog_at ON libraries USING btree (visible_in_catalog_at);


--
-- Name: index_link_expansion_visibilities_on_edgenote_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_link_expansion_visibilities_on_edgenote_id ON link_expansion_visibilities USING btree (edgenote_id);


--
-- Name: index_locks_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_locks_on_case_id ON locks USING btree (case_id);


--
-- Name: index_locks_on_lockable_type_and_lockable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_locks_on_lockable_type_and_lockable_id ON locks USING btree (lockable_type, lockable_id);


--
-- Name: index_locks_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_locks_on_reader_id ON locks USING btree (reader_id);


--
-- Name: index_managerships_on_library_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_managerships_on_library_id ON managerships USING btree (library_id);


--
-- Name: index_managerships_on_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_managerships_on_manager_id ON managerships USING btree (manager_id);


--
-- Name: index_pages_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pages_on_case_id ON pages USING btree (case_id);


--
-- Name: index_podcasts_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_podcasts_on_case_id ON podcasts USING btree (case_id);


--
-- Name: index_questions_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_quiz_id ON questions USING btree (quiz_id);


--
-- Name: index_quizzes_on_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_author_id ON quizzes USING btree (author_id);


--
-- Name: index_quizzes_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_case_id ON quizzes USING btree (case_id);


--
-- Name: index_quizzes_on_lti_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_lti_uid ON quizzes USING btree (lti_uid);


--
-- Name: index_quizzes_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_quizzes_on_template_id ON quizzes USING btree (template_id);


--
-- Name: index_readers_on_active_community_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_readers_on_active_community_id ON readers USING btree (active_community_id);


--
-- Name: index_readers_on_confirmation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_readers_on_confirmation_token ON readers USING btree (confirmation_token);


--
-- Name: index_readers_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_readers_on_email ON readers USING btree (email);


--
-- Name: index_readers_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_readers_on_reset_password_token ON readers USING btree (reset_password_token);


--
-- Name: index_readers_roles_on_reader_id_and_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_readers_roles_on_reader_id_and_role_id ON readers_roles USING btree (reader_id, role_id);


--
-- Name: index_reply_notifications_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reply_notifications_on_reader_id ON reply_notifications USING btree (reader_id);


--
-- Name: index_roles_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_roles_on_name ON roles USING btree (name);


--
-- Name: index_roles_on_name_and_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_roles_on_name_and_resource_type_and_resource_id ON roles USING btree (name, resource_type, resource_id);


--
-- Name: index_submissions_on_quiz_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_submissions_on_quiz_id ON submissions USING btree (quiz_id);


--
-- Name: index_submissions_on_reader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_submissions_on_reader_id ON submissions USING btree (reader_id);


--
-- Name: index_taggings_on_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_case_id ON taggings USING btree (case_id);


--
-- Name: index_taggings_on_case_id_and_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_taggings_on_case_id_and_tag_id ON taggings USING btree (case_id, tag_id);


--
-- Name: index_taggings_on_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tag_id ON taggings USING btree (tag_id);


--
-- Name: index_tags_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tags_on_name ON tags USING btree (name);


--
-- Name: index_visits_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_visits_on_user_id ON visits USING btree (user_id);


--
-- Name: index_visits_on_visit_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_visits_on_visit_token ON visits USING btree (visit_token);


--
-- Name: questions fk_rails_0238c45a86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT fk_rails_0238c45a86 FOREIGN KEY (quiz_id) REFERENCES quizzes(id);


--
-- Name: comment_threads fk_rails_0292337bad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comment_threads
    ADD CONSTRAINT fk_rails_0292337bad FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: answers fk_rails_03d3a93cfc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT fk_rails_03d3a93cfc FOREIGN KEY (submission_id) REFERENCES submissions(id);


--
-- Name: enrollments fk_rails_0411d261ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY enrollments
    ADD CONSTRAINT fk_rails_0411d261ff FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: cases fk_rails_04f7dcd821; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cases
    ADD CONSTRAINT fk_rails_04f7dcd821 FOREIGN KEY (translation_base_id) REFERENCES cases(id);


--
-- Name: locks fk_rails_18e2ec121a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY locks
    ADD CONSTRAINT fk_rails_18e2ec121a FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: managerships fk_rails_3617778c6a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY managerships
    ADD CONSTRAINT fk_rails_3617778c6a FOREIGN KEY (manager_id) REFERENCES readers(id);


--
-- Name: submissions fk_rails_369ed4eb5c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY submissions
    ADD CONSTRAINT fk_rails_369ed4eb5c FOREIGN KEY (quiz_id) REFERENCES quizzes(id);


--
-- Name: enrollments fk_rails_372da43ef7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY enrollments
    ADD CONSTRAINT fk_rails_372da43ef7 FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: group_memberships fk_rails_3977aa5e44; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY group_memberships
    ADD CONSTRAINT fk_rails_3977aa5e44 FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: forums fk_rails_3c3d83e003; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY forums
    ADD CONSTRAINT fk_rails_3c3d83e003 FOREIGN KEY (community_id) REFERENCES communities(id);


--
-- Name: answers fk_rails_3d5ed4418f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT fk_rails_3d5ed4418f FOREIGN KEY (question_id) REFERENCES questions(id);


--
-- Name: communities fk_rails_44a9601cb3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communities
    ADD CONSTRAINT fk_rails_44a9601cb3 FOREIGN KEY (group_id) REFERENCES groups(id);


--
-- Name: answers fk_rails_4baf2a8f31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT fk_rails_4baf2a8f31 FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: case_elements fk_rails_5bad37476a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY case_elements
    ADD CONSTRAINT fk_rails_5bad37476a FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: forums fk_rails_5f30e86c8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY forums
    ADD CONSTRAINT fk_rails_5f30e86c8a FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: comment_threads fk_rails_640f963830; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comment_threads
    ADD CONSTRAINT fk_rails_640f963830 FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: editorships fk_rails_65154bc221; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY editorships
    ADD CONSTRAINT fk_rails_65154bc221 FOREIGN KEY (editor_id) REFERENCES readers(id);


--
-- Name: locks fk_rails_6f28fa384a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY locks
    ADD CONSTRAINT fk_rails_6f28fa384a FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: comments fk_rails_715847c280; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_rails_715847c280 FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: comment_threads fk_rails_76abda4dc1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comment_threads
    ADD CONSTRAINT fk_rails_76abda4dc1 FOREIGN KEY (card_id) REFERENCES cards(id);


--
-- Name: pages fk_rails_7d36788f66; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY pages
    ADD CONSTRAINT fk_rails_7d36788f66 FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: cards fk_rails_8ed9cff919; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cards
    ADD CONSTRAINT fk_rails_8ed9cff919 FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: taggings fk_rails_8fbac4c978; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY taggings
    ADD CONSTRAINT fk_rails_8fbac4c978 FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: managerships fk_rails_98339b9ce3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY managerships
    ADD CONSTRAINT fk_rails_98339b9ce3 FOREIGN KEY (library_id) REFERENCES libraries(id);


--
-- Name: taggings fk_rails_9fcd2e236b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY taggings
    ADD CONSTRAINT fk_rails_9fcd2e236b FOREIGN KEY (tag_id) REFERENCES tags(id);


--
-- Name: comments fk_rails_a5d70e6445; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_rails_a5d70e6445 FOREIGN KEY (comment_thread_id) REFERENCES comment_threads(id);


--
-- Name: comment_threads fk_rails_a6949c9b94; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comment_threads
    ADD CONSTRAINT fk_rails_a6949c9b94 FOREIGN KEY (forum_id) REFERENCES forums(id);


--
-- Name: answers fk_rails_b35896c4ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT fk_rails_b35896c4ab FOREIGN KEY (quiz_id) REFERENCES quizzes(id);


--
-- Name: invitations fk_rails_ba4300c36f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY invitations
    ADD CONSTRAINT fk_rails_ba4300c36f FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: quizzes fk_rails_c22feaf615; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY quizzes
    ADD CONSTRAINT fk_rails_c22feaf615 FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: cards fk_rails_c5d03ef31a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY cards
    ADD CONSTRAINT fk_rails_c5d03ef31a FOREIGN KEY (page_id) REFERENCES pages(id);


--
-- Name: invitations fk_rails_c70c9be1c0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY invitations
    ADD CONSTRAINT fk_rails_c70c9be1c0 FOREIGN KEY (community_id) REFERENCES communities(id);


--
-- Name: deployments fk_rails_c7885b3f7b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY deployments
    ADD CONSTRAINT fk_rails_c7885b3f7b FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: edgenotes fk_rails_cb36917c96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY edgenotes
    ADD CONSTRAINT fk_rails_cb36917c96 FOREIGN KEY (card_id) REFERENCES cards(id);


--
-- Name: editorships fk_rails_cdd20e6a1b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY editorships
    ADD CONSTRAINT fk_rails_cdd20e6a1b FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: group_memberships fk_rails_d05778f88b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY group_memberships
    ADD CONSTRAINT fk_rails_d05778f88b FOREIGN KEY (group_id) REFERENCES groups(id);


--
-- Name: deployments fk_rails_d4d9e0a1aa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY deployments
    ADD CONSTRAINT fk_rails_d4d9e0a1aa FOREIGN KEY (quiz_id) REFERENCES quizzes(id);


--
-- Name: podcasts fk_rails_e228f9f051; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY podcasts
    ADD CONSTRAINT fk_rails_e228f9f051 FOREIGN KEY (case_id) REFERENCES cases(id);


--
-- Name: submissions fk_rails_ea35513632; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY submissions
    ADD CONSTRAINT fk_rails_ea35513632 FOREIGN KEY (reader_id) REFERENCES readers(id);


--
-- Name: deployments fk_rails_f49860c54d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY deployments
    ADD CONSTRAINT fk_rails_f49860c54d FOREIGN KEY (group_id) REFERENCES groups(id);


--
-- Name: readers fk_rails_fc0d035c15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY readers
    ADD CONSTRAINT fk_rails_fc0d035c15 FOREIGN KEY (active_community_id) REFERENCES communities(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20160511194730'),
('20160511203111'),
('20160516145146'),
('20160516153452'),
('20160516153854'),
('20160516155813'),
('20160518190159'),
('20160518190257'),
('20160518190358'),
('20160518192901'),
('20160518200132'),
('20160609160112'),
('20160622194431'),
('20160623134628'),
('20160630171433'),
('20160701213227'),
('20160709160633'),
('20160720200457'),
('20160720200605'),
('20160720200640'),
('20160720202753'),
('20160721182654'),
('20160727194935'),
('20160810151157'),
('20160822194345'),
('20160901142137'),
('20160909151439'),
('20160909214924'),
('20160909215200'),
('20160909215300'),
('20161011183205'),
('20161011183206'),
('20161208171215'),
('20170124223148'),
('20170202221710'),
('20170202221811'),
('20170216193541'),
('20170306195553'),
('20170309181755'),
('20170315154030'),
('20170315190528'),
('20170321155446'),
('20170321164420'),
('20170412173537'),
('20170412175954'),
('20170419172037'),
('20170420172635'),
('20170426200309'),
('20170501193920'),
('20170501221658'),
('20170511212540'),
('20170705153826'),
('20170705164751'),
('20170705165135'),
('20170706155100'),
('20170707160226'),
('20170719190445'),
('20170721144836'),
('20170808143515'),
('20170808143606'),
('20170808150850'),
('20170809151238'),
('20170809153905'),
('20170809171600'),
('20170830013418'),
('20170830201129'),
('20170908211738'),
('20170921172025'),
('20171023182346'),
('20171024180715'),
('20171025205053'),
('20171030185254'),
('20171031161433'),
('20171113192541'),
('20171220165301'),
('20180119170858'),
('20180129143420'),
('20180206151601'),
('20180212172121'),
('20180219152023'),
('20180220162824'),
('20180221153559'),
('20180321161907'),
('20180405141157'),
('20180405181811'),
('20180423145615'),
('20180502185535'),
('20180518184926'),
('20180525133320'),
('20180529153730'),
('20180627142157'),
('20180627142644'),
('20180725173214'),
('20180806201126'),
('20180806201127'),
('20180824210458'),
('20180827153920'),
('20180828192116'),
('20180911154308'),
('20180911155612'),
('20180919145935');


